import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as crypto from 'crypto';
import axios, { AxiosInstance } from 'axios';

export interface UploadSignedUrlOptions {
  fileName: string;
  contentType?: string;
  expiresIn?: number; // seconds
  maxSize?: number; // bytes
}

export interface PlaybackSignedUrlOptions {
  videoId: string;
  expiresIn?: number; // seconds
  ipAddress?: string;
  token?: string;
}

export interface BunnyVideoCreateResponse {
  guid: string;
  title: string;
  status: number;
  thumbnailUrl?: string;
  playbackUrl?: string;
}

@Injectable()
export class BunnyService {
  private readonly logger = new Logger(BunnyService.name);
  private readonly storageApi: AxiosInstance;
  private readonly streamApi: AxiosInstance;
  
  private readonly storageZone: string;
  private readonly storageHostname: string;
  private readonly pullZoneHostname: string;
  private readonly signingKey: string;
  private readonly webhookSecret: string;
  
  private readonly streamLibraryId: string;
  private readonly streamHost: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('bunny-video') private readonly videoQueue: Queue,
    @InjectQueue('bunny-image') private readonly imageQueue: Queue,
  ) {
    // Storage configuration
    this.storageZone = this.configService.get<string>('bunny.storageZone');
    this.storageHostname = this.configService.get<string>('bunny.storageHostname');
    this.pullZoneHostname = this.configService.get<string>('bunny.pullZoneHostname');
    this.signingKey = this.configService.get<string>('bunny.signingKey');
    this.webhookSecret = this.configService.get<string>('bunny.webhookSecret');
    
    // Stream configuration
    this.streamLibraryId = this.configService.get<string>('bunny.stream.libraryId');
    this.streamHost = this.configService.get<string>('bunny.stream.host');

    // Storage API client
    this.storageApi = axios.create({
      baseURL: `https://${this.storageHostname}`,
      headers: {
        'AccessKey': this.configService.get<string>('bunny.accessKey'),
      },
    });

    // Stream API client
    this.streamApi = axios.create({
      baseURL: this.configService.get<string>('bunny.stream.api'),
      headers: {
        'AccessKey': this.configService.get<string>('bunny.stream.apiKey'),
      },
    });
  }

  /**
   * Generate a signed upload URL for direct client uploads to Bunny Storage
   */
  generateStorageUploadUrl(options: UploadSignedUrlOptions): string {
    const { fileName, expiresIn = 3600 } = options;
    const path = `/${this.storageZone}/${fileName}`;
    const expires = Math.floor(Date.now() / 1000) + expiresIn;
    
    // Create signature for secure upload
    const authString = `${this.signingKey}${path}${expires}`;
    const authHash = crypto.createHash('sha256').update(authString).digest('base64');
    const token = authHash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    return `https://${this.storageHostname}${path}?token=${token}&expires=${expires}`;
  }

  /**
   * Generate a signed CDN URL for secure content delivery
   */
  generateCdnSignedUrl(path: string, expiresIn = 3600): string {
    const expires = Math.floor(Date.now() / 1000) + expiresIn;
    const hashableBase = `${this.signingKey}${path}${expires}`;
    const token = crypto.createHash('sha256')
      .update(hashableBase)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    return `https://${this.pullZoneHostname}${path}?token=${token}&expires=${expires}`;
  }

  /**
   * Upload file to Bunny Storage
   */
  async uploadToStorage(
    file: Buffer,
    path: string,
    contentType?: string,
  ): Promise<string> {
    try {
      const uploadPath = `/${this.storageZone}/${path}`;
      
      await this.storageApi.put(uploadPath, file, {
        headers: {
          'Content-Type': contentType || 'application/octet-stream',
        },
      });

      // Add to processing queue for optimization
      if (contentType?.startsWith('image/')) {
        await this.imageQueue.add('optimize', { path });
      }

      return `https://${this.pullZoneHostname}/${path}`;
    } catch (error) {
      this.logger.error(`Failed to upload to Bunny Storage: ${error.message}`);
      throw new HttpException(
        'Failed to upload file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete file from Bunny Storage
   */
  async deleteFromStorage(path: string): Promise<void> {
    try {
      const deletePath = `/${this.storageZone}/${path}`;
      await this.storageApi.delete(deletePath);
      
      // Purge from CDN cache
      await this.purgeCdnCache(path);
    } catch (error) {
      this.logger.error(`Failed to delete from Bunny Storage: ${error.message}`);
      throw new HttpException(
        'Failed to delete file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create video in Bunny Stream
   */
  async createStreamVideo(title: string, collectionId?: string): Promise<BunnyVideoCreateResponse> {
    try {
      const response = await this.streamApi.post(
        `/library/${this.streamLibraryId}/videos`,
        {
          title,
          collectionId,
        },
      );

      return {
        guid: response.data.guid,
        title: response.data.title,
        status: response.data.status,
        thumbnailUrl: response.data.thumbnailUrl,
        playbackUrl: `https://${this.streamHost}/${response.data.guid}/playlist.m3u8`,
      };
    } catch (error) {
      this.logger.error(`Failed to create Bunny Stream video: ${error.message}`);
      throw new HttpException(
        'Failed to create video',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Upload video to Bunny Stream
   */
  async uploadToStream(videoGuid: string, file: Buffer): Promise<void> {
    try {
      await this.streamApi.put(
        `/library/${this.streamLibraryId}/videos/${videoGuid}`,
        file,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
          },
        },
      );

      // Add to processing queue
      await this.videoQueue.add('process', { 
        videoGuid,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.logger.error(`Failed to upload to Bunny Stream: ${error.message}`);
      throw new HttpException(
        'Failed to upload video',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get video details from Bunny Stream
   */
  async getStreamVideo(videoGuid: string): Promise<any> {
    try {
      const response = await this.streamApi.get(
        `/library/${this.streamLibraryId}/videos/${videoGuid}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get Bunny Stream video: ${error.message}`);
      throw new HttpException(
        'Video not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Delete video from Bunny Stream
   */
  async deleteStreamVideo(videoGuid: string): Promise<void> {
    try {
      await this.streamApi.delete(
        `/library/${this.streamLibraryId}/videos/${videoGuid}`,
      );
    } catch (error) {
      this.logger.error(`Failed to delete Bunny Stream video: ${error.message}`);
      throw new HttpException(
        'Failed to delete video',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate signed playback URL for Bunny Stream video
   */
  generateStreamPlaybackUrl(options: PlaybackSignedUrlOptions): string {
    const { videoId, expiresIn = 3600, ipAddress, token } = options;
    const expires = Math.floor(Date.now() / 1000) + expiresIn;
    
    const authString = `${this.signingKey}${videoId}${expires}${ipAddress || ''}`;
    const authHash = crypto.createHash('sha256').update(authString).digest('hex');
    
    let url = `https://${this.streamHost}/${videoId}/playlist.m3u8?`;
    url += `token=${authHash}&expires=${expires}`;
    
    if (ipAddress) {
      url += `&ip=${ipAddress}`;
    }
    
    if (token) {
      url += `&session=${token}`;
    }
    
    return url;
  }

  /**
   * Verify webhook signature from Bunny
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      this.logger.warn('Webhook secret not configured');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Purge CDN cache for a specific path
   */
  private async purgeCdnCache(path: string): Promise<void> {
    try {
      const purgeUrl = `https://api.bunny.net/purge?url=https://${this.pullZoneHostname}/${path}`;
      await axios.post(purgeUrl, null, {
        headers: {
          'AccessKey': this.configService.get<string>('bunny.accessKey'),
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to purge CDN cache: ${error.message}`);
    }
  }

  /**
   * Generate thumbnail URL for video
   */
  generateVideoThumbnailUrl(videoGuid: string, time?: number): string {
    const timestamp = time || 1; // Default to 1 second
    return `https://${this.streamHost}/${videoGuid}/thumbnail.jpg?v=${timestamp}`;
  }

  /**
   * Check storage usage
   */
  async getStorageStatistics(): Promise<any> {
    try {
      const response = await axios.get(
        `https://api.bunny.net/storagezone/${this.storageZone}/statistics`,
        {
          headers: {
            'AccessKey': this.configService.get<string>('bunny.accessKey'),
          },
        },
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get storage statistics: ${error.message}`);
      throw new HttpException(
        'Failed to get storage statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
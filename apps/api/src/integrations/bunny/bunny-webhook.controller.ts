import {
  Controller,
  Post,
  Body,
  Headers,
  HttpException,
  HttpStatus,
  Logger,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { BunnyService } from './bunny.service';
import { PrismaService } from '@/modules/database/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

interface BunnyWebhookPayload {
  VideoGuid?: string;
  Status?: number;
  VideoLibraryId?: number;
  Title?: string;
  DateUploaded?: string;
  DatePublished?: string;
  Length?: number;
  ThumbnailUrl?: string;
  FileName?: string;
  StorageUrl?: string;
  EventType?: string;
  ObjectKey?: string;
}

@ApiTags('webhooks')
@Controller('webhooks/bunny')
export class BunnyWebhookController {
  private readonly logger = new Logger(BunnyWebhookController.name);

  constructor(
    private readonly bunnyService: BunnyService,
    private readonly prisma: PrismaService,
    @InjectQueue('bunny-video') private readonly videoQueue: Queue,
  ) {}

  @Post()
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Body() payload: BunnyWebhookPayload,
    @Headers('bunny-webhook-signature') signature: string,
    @Req() request: FastifyRequest,
  ) {
    // Verify webhook signature
    const rawBody = JSON.stringify(payload);
    if (!this.bunnyService.verifyWebhookSignature(rawBody, signature)) {
      this.logger.warn('Invalid webhook signature received');
      throw new HttpException('Invalid signature', HttpStatus.FORBIDDEN);
    }

    this.logger.log(`Received Bunny webhook: ${payload.EventType || 'video-update'}`);

    try {
      // Handle different webhook types
      if (payload.VideoGuid) {
        await this.handleVideoWebhook(payload);
      } else if (payload.ObjectKey) {
        await this.handleStorageWebhook(payload);
      } else {
        this.logger.warn('Unknown webhook payload type', payload);
      }

      return { status: 'success', processed: true };
    } catch (error) {
      this.logger.error(`Failed to process webhook: ${error.message}`, error.stack);
      
      // Return success to prevent retries for non-critical errors
      // Queue for retry internally if needed
      await this.videoQueue.add(
        'webhook-retry',
        { payload, timestamp: Date.now() },
        { delay: 5000, attempts: 3 },
      );
      
      return { status: 'queued', message: 'Webhook queued for processing' };
    }
  }

  private async handleVideoWebhook(payload: BunnyWebhookPayload) {
    const { VideoGuid, Status, Length, ThumbnailUrl } = payload;

    // Check for duplicate processing (idempotency)
    const existingVideo = await this.prisma.video.findUnique({
      where: { bunnyId: VideoGuid },
    });

    if (!existingVideo) {
      this.logger.warn(`Video not found in database: ${VideoGuid}`);
      return;
    }

    // Status codes from Bunny Stream
    // 0 = Queued, 1 = Processing, 2 = Encoding, 3 = Resolution, 4 = Finished, 5 = Error
    let videoStatus = 'processing';
    switch (Status) {
      case 0:
        videoStatus = 'pending';
        break;
      case 1:
      case 2:
      case 3:
        videoStatus = 'processing';
        break;
      case 4:
        videoStatus = 'ready';
        break;
      case 5:
        videoStatus = 'failed';
        break;
    }

    // Update video status
    await this.prisma.video.update({
      where: { bunnyId: VideoGuid },
      data: {
        status: videoStatus,
        duration: Length || undefined,
        thumbnailUrl: ThumbnailUrl || undefined,
        playbackUrl: videoStatus === 'ready' 
          ? this.bunnyService.generateStreamPlaybackUrl({ videoId: VideoGuid })
          : undefined,
        updatedAt: new Date(),
      },
    });

    // Send notifications or trigger further processing
    if (videoStatus === 'ready') {
      await this.videoQueue.add('video-ready', {
        videoId: existingVideo.id,
        bunnyId: VideoGuid,
      });
    } else if (videoStatus === 'failed') {
      await this.videoQueue.add('video-failed', {
        videoId: existingVideo.id,
        bunnyId: VideoGuid,
      });
    }

    this.logger.log(`Updated video ${VideoGuid} status to ${videoStatus}`);
  }

  private async handleStorageWebhook(payload: BunnyWebhookPayload) {
    const { EventType, ObjectKey, StorageUrl } = payload;

    switch (EventType) {
      case 'upload':
        this.logger.log(`File uploaded: ${ObjectKey}`);
        // Update any pending media records
        if (ObjectKey) {
          await this.prisma.media.updateMany({
            where: { 
              url: {
                contains: ObjectKey,
              },
            },
            data: {
              url: StorageUrl || `https://${this.bunnyService['pullZoneHostname']}/${ObjectKey}`,
            },
          });
        }
        break;

      case 'delete':
        this.logger.log(`File deleted: ${ObjectKey}`);
        // Clean up any related records
        if (ObjectKey) {
          await this.prisma.media.deleteMany({
            where: {
              url: {
                contains: ObjectKey,
              },
            },
          });
        }
        break;

      default:
        this.logger.warn(`Unknown storage event type: ${EventType}`);
    }
  }
}
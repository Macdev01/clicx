# Bunny CDN/Stream Integration

## Overview

This module provides a secure, production-ready integration with BunnyCDN for both Storage/CDN and Video Streaming services.

## Features

### Storage/CDN
- ✅ Secure file uploads with signed URLs
- ✅ CDN delivery with token authentication
- ✅ Automatic cache purging on delete
- ✅ Storage statistics and monitoring
- ✅ Webhook processing for upload/delete events

### Video Streaming
- ✅ Video upload and processing
- ✅ Secure playback with signed URLs
- ✅ Automatic thumbnail generation
- ✅ Status tracking (pending → processing → ready)
- ✅ Webhook-based status updates
- ✅ Idempotent webhook processing

## Configuration

### Required Environment Variables

```env
# Storage/CDN Configuration
BUNNY_ACCESS_KEY=your-account-api-key
BUNNY_STORAGE_ZONE=your-storage-zone-name
BUNNY_STORAGE_HOSTNAME=storage.bunnycdn.com
BUNNY_PULL_ZONE_HOSTNAME=your-pullzone.b-cdn.net
BUNNY_SIGNING_KEY=your-pullzone-signing-key
BUNNY_WEBHOOK_SECRET=your-webhook-secret

# Stream Configuration (if using video streaming)
BUNNY_STREAM_API=https://video.bunnycdn.com
BUNNY_STREAM_API_KEY=your-stream-api-key
BUNNY_STREAM_LIBRARY_ID=your-library-id
BUNNY_STREAM_HOST=vz-xxx.b-cdn.net
```

## API Endpoints

### Upload Endpoints

#### Generate Upload URL
```http
POST /api/v1/media/upload-url
{
  "fileName": "video.mp4",
  "contentType": "video/mp4",
  "expiresIn": 3600
}
```

#### Direct Upload
```http
POST /api/v1/media/upload
Content-Type: multipart/form-data

file: <binary>
type: "video" | "image"
```

### Playback Endpoints

#### Get Signed Playback URL
```http
GET /api/v1/media/{id}/playback-url
```

Returns:
```json
{
  "url": "https://vz-xxx.b-cdn.net/{guid}/playlist.m3u8?token=xxx&expires=xxx",
  "expires": 1234567890,
  "thumbnailUrl": "https://vz-xxx.b-cdn.net/{guid}/thumbnail.jpg"
}
```

## Webhook Configuration

### Bunny Dashboard Setup

1. Navigate to your Bunny panel
2. Go to Stream → API → Webhooks
3. Add webhook URL: `https://yourdomain.com/api/webhooks/bunny`
4. Set secret key (use as `BUNNY_WEBHOOK_SECRET`)
5. Enable events:
   - Video Upload Completed
   - Video Processing Completed
   - Video Processing Failed

### Webhook Security

- **HMAC Signature Verification**: All webhooks are verified using HMAC-SHA256
- **Idempotency**: Duplicate webhooks are handled gracefully
- **Retry Logic**: Failed processing is queued for retry with exponential backoff

## Security Best Practices

### 1. Token-Based Authentication
All public URLs are signed with expiring tokens:
```javascript
// Never expose permanent URLs
// Always use signed URLs with short TTL
const signedUrl = bunnyService.generateCdnSignedUrl(path, 3600); // 1 hour
```

### 2. Access Control
- Server-side upload URL generation only
- User ownership validation before generating URLs
- IP-based restrictions for premium content

### 3. Rate Limiting
- Upload endpoints are rate-limited per user
- Webhook endpoints have separate rate limits

### 4. Content Validation
- File type validation
- File size limits (configurable)
- Virus scanning integration (optional)

## Usage Examples

### Upload Video Flow

```typescript
// 1. Create video record
const video = await prisma.video.create({
  data: {
    title: 'My Video',
    userId: user.id,
    status: 'pending',
  },
});

// 2. Create Bunny Stream video
const bunnyVideo = await bunnyService.createStreamVideo(video.title);

// 3. Upload to Bunny
await bunnyService.uploadToStream(bunnyVideo.guid, videoBuffer);

// 4. Update database
await prisma.video.update({
  where: { id: video.id },
  data: {
    bunnyId: bunnyVideo.guid,
    status: 'processing',
  },
});

// 5. Webhook will update status when ready
```

### Upload Image Flow

```typescript
// 1. Generate unique path
const path = `images/${userId}/${uuid()}.jpg`;

// 2. Upload to storage
const cdnUrl = await bunnyService.uploadToStorage(imageBuffer, path, 'image/jpeg');

// 3. Save to database
await prisma.image.create({
  data: {
    userId,
    cdnUrl,
    bunnyPath: path,
  },
});
```

### Generate Secure Playback URL

```typescript
// For authenticated users
const playbackUrl = bunnyService.generateStreamPlaybackUrl({
  videoId: video.bunnyId,
  expiresIn: 7200, // 2 hours
  ipAddress: request.ip, // Optional: lock to user's IP
  token: user.sessionId, // Optional: session-based access
});
```

## Monitoring & Metrics

### Key Metrics to Track

1. **Upload Success Rate**
   - Track failed uploads
   - Monitor upload duration

2. **Video Processing Time**
   - Time from upload to ready status
   - Processing failure rate

3. **CDN Performance**
   - Cache hit ratio
   - Bandwidth usage
   - Response times

4. **Webhook Processing**
   - Webhook delivery success rate
   - Processing latency
   - Retry queue depth

### Health Checks

```typescript
// Health check endpoint includes Bunny status
GET /api/health

{
  "bunny": {
    "storage": "healthy",
    "stream": "healthy",
    "webhooks": {
      "lastReceived": "2024-01-15T10:30:00Z",
      "queueDepth": 0
    }
  }
}
```

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid signature` | Wrong webhook secret | Verify `BUNNY_WEBHOOK_SECRET` |
| `Upload failed` | Network or auth issue | Check API keys and network |
| `Video not found` | Invalid GUID | Verify video exists in Bunny |
| `Quota exceeded` | Storage limit reached | Check Bunny account limits |

### Retry Strategy

```typescript
// Automatic retry with exponential backoff
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000, // 5s, 10s, 20s
  },
}
```

## Testing

### Unit Tests
```bash
npm test bunny.service.spec.ts
```

### Integration Tests
```bash
npm run test:e2e bunny.e2e-spec.ts
```

### Manual Testing
1. Use Bunny's test mode for webhook testing
2. Upload test files via API
3. Verify CDN delivery
4. Test playback URL generation

## Migration from Other Providers

### From AWS S3/CloudFront
1. Export existing files
2. Bulk upload to Bunny Storage
3. Update database URLs
4. Implement signed URL generation

### From Cloudinary
1. Download originals
2. Re-upload to Bunny
3. Update transformation logic
4. Migrate webhook handlers

## Support

- [Bunny Documentation](https://docs.bunny.net)
- [API Reference](https://docs.bunny.net/reference)
- Internal: Check `#platform-media` Slack channel
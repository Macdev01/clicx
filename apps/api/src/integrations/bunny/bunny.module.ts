import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { BunnyService } from './bunny.service';
import { BunnyController } from './bunny.controller';
import { BunnyWebhookController } from './bunny-webhook.controller';
import { BunnyVideoProcessor } from './processors/video.processor';
import { BunnyImageProcessor } from './processors/image.processor';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue(
      { name: 'bunny-video' },
      { name: 'bunny-image' },
    ),
  ],
  controllers: [BunnyController, BunnyWebhookController],
  providers: [BunnyService, BunnyVideoProcessor, BunnyImageProcessor],
  exports: [BunnyService],
})
export class BunnyModule {}
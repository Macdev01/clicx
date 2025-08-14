import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { PlisioService } from './plisio.service';
import { PlisioController } from './plisio.controller';
import { PlisioWebhookController } from './plisio-webhook.controller';
import { PaymentProcessor } from './processors/payment.processor';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({ name: 'payments' }),
  ],
  controllers: [PlisioController, PlisioWebhookController],
  providers: [PlisioService, PaymentProcessor],
  exports: [PlisioService],
})
export class PlisioModule {}
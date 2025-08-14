import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { PlisioService, PlisioWebhookPayload, PaymentStatus } from './plisio.service';
import { PrismaService } from '@/modules/database/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@ApiTags('webhooks')
@Controller('webhooks/plisio')
export class PlisioWebhookController {
  private readonly logger = new Logger(PlisioWebhookController.name);

  constructor(
    private readonly plisioService: PlisioService,
    private readonly prisma: PrismaService,
    @InjectQueue('payments') private readonly paymentQueue: Queue,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiExcludeEndpoint()
  async handleWebhook(@Body() payload: PlisioWebhookPayload) {
    this.logger.log(`Received Plisio webhook for transaction: ${payload.txn_id}`);

    // Verify webhook signature
    if (!this.plisioService.verifyWebhookSignature(payload)) {
      this.logger.warn('Invalid Plisio webhook signature');
      throw new HttpException('Invalid signature', HttpStatus.FORBIDDEN);
    }

    try {
      // Check for idempotency - prevent duplicate processing
      const existingPayment = await this.prisma.payment.findUnique({
        where: { txnId: payload.txn_id },
      });

      if (existingPayment) {
        // Check if this is a status update
        if (existingPayment.status === payload.status) {
          this.logger.log(`Duplicate webhook for ${payload.txn_id}, ignoring`);
          return { status: 'success', message: 'Already processed' };
        }

        // Validate state transitions
        if (!this.isValidStatusTransition(existingPayment.status, payload.status)) {
          this.logger.warn(
            `Invalid status transition for ${payload.txn_id}: ${existingPayment.status} -> ${payload.status}`,
          );
          return { status: 'error', message: 'Invalid status transition' };
        }
      }

      // Process the payment update
      await this.processPaymentWebhook(payload, existingPayment);

      return { status: 'success', message: 'Webhook processed' };
    } catch (error) {
      this.logger.error(`Failed to process Plisio webhook: ${error.message}`, error.stack);

      // Queue for retry
      await this.paymentQueue.add(
        'webhook-retry',
        { payload, timestamp: Date.now() },
        { delay: 5000, attempts: 3 },
      );

      // Return success to prevent Plisio from retrying
      return { status: 'queued', message: 'Webhook queued for processing' };
    }
  }

  private async processPaymentWebhook(
    payload: PlisioWebhookPayload,
    existingPayment: any,
  ): Promise<void> {
    const {
      txn_id,
      order_number,
      amount,
      currency,
      status,
      source_amount,
      source_currency,
      tx_hash,
      confirmations,
      expected_confirmations,
    } = payload;

    // Start transaction for atomic updates
    await this.prisma.$transaction(async (tx) => {
      // Update or create payment record
      const payment = await tx.payment.upsert({
        where: { txnId: txn_id },
        update: {
          status,
          amount,
          currency,
          plisioData: payload as any,
          updatedAt: new Date(),
        },
        create: {
          txnId: txn_id,
          orderNumber: order_number,
          amount,
          currency,
          status,
          plisioData: payload as any,
        },
      });

      // Update related order if exists
      if (order_number) {
        const order = await tx.order.findFirst({
          where: { id: order_number },
        });

        if (order) {
          let orderStatus = 'pending';
          if (status === 'completed') {
            orderStatus = 'completed';
          } else if (['expired', 'cancelled', 'error'].includes(status)) {
            orderStatus = 'failed';
          }

          await tx.order.update({
            where: { id: order.id },
            data: {
              status: orderStatus,
              updatedAt: new Date(),
            },
          });

          // If payment completed, update user balance
          if (status === 'completed' && !existingPayment) {
            await tx.user.update({
              where: { id: order.userId },
              data: {
                balance: {
                  increment: Math.floor(parseFloat(amount)),
                },
              },
            });

            // Create audit log
            await tx.log.create({
              data: {
                level: 'info',
                message: `Payment completed for order ${order_number}`,
                metadata: {
                  txnId: txn_id,
                  amount,
                  currency,
                  userId: order.userId,
                  txHash: tx_hash,
                },
              },
            });
          }
        }
      }

      // Handle different payment statuses
      switch (status) {
        case 'completed':
          await this.handleCompletedPayment(tx, payload, payment);
          break;
        case 'pending':
          await this.handlePendingPayment(tx, payload, payment, confirmations, expected_confirmations);
          break;
        case 'expired':
        case 'cancelled':
          await this.handleFailedPayment(tx, payload, payment);
          break;
        case 'error':
        case 'mismatch':
          await this.handleErrorPayment(tx, payload, payment);
          break;
      }
    });

    // Process through service for additional handling
    await this.plisioService.processPaymentUpdate(payload);
  }

  private async handleCompletedPayment(tx: any, payload: PlisioWebhookPayload, payment: any) {
    this.logger.log(`Payment completed: ${payload.txn_id}`);

    // Emit events for completed payment
    await this.paymentQueue.add('payment-success', {
      paymentId: payment.id,
      txnId: payload.txn_id,
      orderNumber: payload.order_number,
      amount: payload.amount,
      currency: payload.currency,
      txHash: payload.tx_hash,
      txUrl: payload.tx_url,
    });

    // Send notification to user
    await this.paymentQueue.add('send-payment-notification', {
      type: 'payment-completed',
      paymentId: payment.id,
      userId: payment.order?.userId,
    });
  }

  private async handlePendingPayment(
    tx: any,
    payload: PlisioWebhookPayload,
    payment: any,
    confirmations: number,
    expectedConfirmations: number,
  ) {
    this.logger.log(
      `Payment pending: ${payload.txn_id} (${confirmations}/${expectedConfirmations} confirmations)`,
    );

    // Update confirmation progress
    await tx.log.create({
      data: {
        level: 'info',
        message: `Payment confirmation progress: ${confirmations}/${expectedConfirmations}`,
        metadata: {
          txnId: payload.txn_id,
          confirmations,
          expectedConfirmations,
        },
      },
    });

    // Send progress notification if close to completion
    if (confirmations >= expectedConfirmations * 0.8) {
      await this.paymentQueue.add('send-payment-notification', {
        type: 'payment-confirming',
        paymentId: payment.id,
        confirmations,
        expectedConfirmations,
      });
    }
  }

  private async handleFailedPayment(tx: any, payload: PlisioWebhookPayload, payment: any) {
    this.logger.warn(`Payment failed: ${payload.txn_id} - ${payload.status}`);

    // Log failure
    await tx.log.create({
      data: {
        level: 'warn',
        message: `Payment failed: ${payload.status}`,
        metadata: {
          txnId: payload.txn_id,
          status: payload.status,
          comment: payload.comment,
        },
      },
    });

    // Send failure notification
    await this.paymentQueue.add('send-payment-notification', {
      type: 'payment-failed',
      paymentId: payment.id,
      reason: payload.status,
    });
  }

  private async handleErrorPayment(tx: any, payload: PlisioWebhookPayload, payment: any) {
    this.logger.error(`Payment error: ${payload.txn_id} - ${payload.status}`);

    // Log error with details
    await tx.log.create({
      data: {
        level: 'error',
        message: `Payment error: ${payload.status}`,
        metadata: {
          txnId: payload.txn_id,
          status: payload.status,
          comment: payload.comment,
          sourceAmount: payload.source_amount,
          expectedAmount: payload.amount,
        },
      },
    });

    // Queue for manual review
    await this.paymentQueue.add('payment-review', {
      paymentId: payment.id,
      txnId: payload.txn_id,
      issue: payload.status,
      details: payload.comment,
    });
  }

  private isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    // Define valid status transitions
    const validTransitions: Record<string, string[]> = {
      new: ['pending', 'expired', 'cancelled'],
      pending: ['completed', 'expired', 'cancelled', 'error', 'mismatch'],
      completed: [], // Final state
      expired: [], // Final state
      cancelled: [], // Final state
      error: ['pending', 'completed'], // Can retry
      mismatch: ['completed'], // Can be resolved
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
  }
}
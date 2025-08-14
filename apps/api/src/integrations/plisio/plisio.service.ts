import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

export interface CreateInvoiceDto {
  orderName: string;
  orderNumber: string;
  amount: string;
  currency: string;
  email?: string;
  description?: string;
  callbackUrl?: string;
  successUrl?: string;
  failUrl?: string;
  language?: string;
  expireMin?: number;
}

export interface PlisioInvoiceResponse {
  status: string;
  message?: string;
  data?: {
    txn_id: string;
    invoice_url: string;
    amount: string;
    pending_amount: string;
    currency: string;
    source_currency: string;
    source_amount: string;
    source_rate: string;
    expected_confirmations: number;
    qr_code: string;
    verify_hash: string;
    invoice_commission: string;
    invoice_sum: string;
    invoice_total_sum: string;
    psys_cid: string;
    expire_at: number;
  };
}

export interface PlisioWebhookPayload {
  txn_id: string;
  order_number: string;
  order_name: string;
  amount: string;
  currency: string;
  status: string; // pending, completed, error, new, expired, mismatch, cancelled
  source_currency: string;
  source_amount: string;
  source_rate: string;
  confirmations: number;
  expected_confirmations: number;
  tx_hash?: string;
  tx_url?: string;
  invoice_commission?: string;
  invoice_sum?: string;
  invoice_total_sum?: string;
  comment?: string;
  hash?: string; // HMAC signature
}

export enum PaymentStatus {
  NEW = 'new',
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  ERROR = 'error',
  MISMATCH = 'mismatch',
}

@Injectable()
export class PlisioService {
  private readonly logger = new Logger(PlisioService.name);
  private readonly plisioApi: AxiosInstance;
  private readonly apiKey: string;
  private readonly secretKey: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('payments') private readonly paymentQueue: Queue,
  ) {
    this.apiKey = this.configService.get<string>('plisio.apiKey');
    this.secretKey = this.configService.get<string>('plisio.secretKey');

    this.plisioApi = axios.create({
      baseURL: 'https://plisio.net/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create a new payment invoice
   */
  async createInvoice(dto: CreateInvoiceDto): Promise<PlisioInvoiceResponse> {
    try {
      const params = new URLSearchParams({
        api_key: this.apiKey,
        order_name: dto.orderName,
        order_number: dto.orderNumber,
        amount: dto.amount,
        currency: dto.currency,
        email: dto.email || '',
        description: dto.description || '',
        callback_url: dto.callbackUrl || this.configService.get<string>('plisio.webhookUrl'),
        success_url: dto.successUrl || '',
        fail_url: dto.failUrl || '',
        language: dto.language || 'en',
        expire_min: String(dto.expireMin || 1440), // 24 hours default
      });

      const response = await this.plisioApi.post(`/invoices/new?${params.toString()}`);

      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to create invoice');
      }

      // Queue for monitoring
      await this.paymentQueue.add(
        'monitor-payment',
        {
          txnId: response.data.data.txn_id,
          orderNumber: dto.orderNumber,
          amount: dto.amount,
          currency: dto.currency,
        },
        {
          delay: 60000, // Check after 1 minute
          attempts: 10,
          backoff: {
            type: 'exponential',
            delay: 60000,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create Plisio invoice: ${error.message}`);
      throw new HttpException(
        'Failed to create payment invoice',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get invoice details by transaction ID
   */
  async getInvoice(txnId: string): Promise<any> {
    try {
      const params = new URLSearchParams({
        api_key: this.apiKey,
      });

      const response = await this.plisioApi.get(`/operations/${txnId}?${params.toString()}`);

      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Invoice not found');
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to get Plisio invoice: ${error.message}`);
      throw new HttpException(
        'Invoice not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(params: PlisioWebhookPayload): boolean {
    if (!this.secretKey) {
      this.logger.warn('Plisio secret key not configured');
      return false;
    }

    const receivedHash = params.hash;
    if (!receivedHash) {
      this.logger.warn('No hash in webhook payload');
      return false;
    }

    // Remove hash from params for verification
    const verifyParams = { ...params };
    delete verifyParams.hash;

    // Sort parameters alphabetically
    const sortedKeys = Object.keys(verifyParams).sort();
    
    // Build verification string
    let verifyString = '';
    for (const key of sortedKeys) {
      if (verifyParams[key] !== undefined && verifyParams[key] !== null) {
        verifyString += `${key}=${verifyParams[key]}|`;
      }
    }
    verifyString += this.secretKey;

    // Calculate MD5 hash
    const calculatedHash = crypto
      .createHash('md5')
      .update(verifyString)
      .digest('hex');

    const isValid = calculatedHash.toLowerCase() === receivedHash.toLowerCase();
    
    if (!isValid) {
      this.logger.warn(`Invalid webhook signature. Expected: ${calculatedHash}, Received: ${receivedHash}`);
    }

    return isValid;
  }

  /**
   * Process payment status update
   */
  async processPaymentUpdate(payload: PlisioWebhookPayload): Promise<void> {
    const { txn_id, status, order_number, amount, currency } = payload;

    this.logger.log(`Processing payment update: ${txn_id} - ${status}`);

    // Map Plisio status to internal status
    let internalStatus = PaymentStatus.PENDING;
    switch (status) {
      case 'new':
        internalStatus = PaymentStatus.NEW;
        break;
      case 'pending':
        internalStatus = PaymentStatus.PENDING;
        break;
      case 'completed':
        internalStatus = PaymentStatus.COMPLETED;
        break;
      case 'expired':
        internalStatus = PaymentStatus.EXPIRED;
        break;
      case 'cancelled':
        internalStatus = PaymentStatus.CANCELLED;
        break;
      case 'error':
      case 'mismatch':
        internalStatus = PaymentStatus.ERROR;
        break;
    }

    // Queue for processing based on status
    const jobName = `process-${internalStatus}`;
    await this.paymentQueue.add(jobName, {
      txnId: txn_id,
      orderNumber: order_number,
      amount,
      currency,
      status: internalStatus,
      originalPayload: payload,
      timestamp: Date.now(),
    });

    // Handle specific status changes
    switch (internalStatus) {
      case PaymentStatus.COMPLETED:
        await this.handlePaymentCompleted(payload);
        break;
      case PaymentStatus.EXPIRED:
      case PaymentStatus.CANCELLED:
        await this.handlePaymentFailed(payload);
        break;
      case PaymentStatus.ERROR:
      case PaymentStatus.MISMATCH:
        await this.handlePaymentError(payload);
        break;
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentCompleted(payload: PlisioWebhookPayload): Promise<void> {
    this.logger.log(`Payment completed: ${payload.txn_id}`);
    
    // Emit domain event for other services to react
    await this.paymentQueue.add('payment-completed', {
      txnId: payload.txn_id,
      orderNumber: payload.order_number,
      amount: payload.amount,
      currency: payload.currency,
      txHash: payload.tx_hash,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(payload: PlisioWebhookPayload): Promise<void> {
    this.logger.warn(`Payment failed: ${payload.txn_id} - ${payload.status}`);
    
    await this.paymentQueue.add('payment-failed', {
      txnId: payload.txn_id,
      orderNumber: payload.order_number,
      reason: payload.status,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle payment error
   */
  private async handlePaymentError(payload: PlisioWebhookPayload): Promise<void> {
    this.logger.error(`Payment error: ${payload.txn_id} - ${payload.status}`);
    
    await this.paymentQueue.add('payment-error', {
      txnId: payload.txn_id,
      orderNumber: payload.order_number,
      error: payload.comment || payload.status,
      timestamp: Date.now(),
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  }

  /**
   * Calculate invoice amount with commission
   */
  calculateInvoiceAmount(amount: number, includeCommission = true): {
    amount: string;
    commission: string;
    total: string;
  } {
    const commissionRate = 0.005; // 0.5% commission
    const commission = includeCommission ? amount * commissionRate : 0;
    const total = amount + commission;

    return {
      amount: amount.toFixed(2),
      commission: commission.toFixed(2),
      total: total.toFixed(2),
    };
  }

  /**
   * Get payment statistics
   */
  async getPaymentStatistics(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      const params = new URLSearchParams({
        api_key: this.apiKey,
      });

      if (startDate) {
        params.append('date_from', Math.floor(startDate.getTime() / 1000).toString());
      }
      if (endDate) {
        params.append('date_to', Math.floor(endDate.getTime() / 1000).toString());
      }

      const response = await this.plisioApi.get(`/operations?${params.toString()}`);
      
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to get statistics');
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to get payment statistics: ${error.message}`);
      throw new HttpException(
        'Failed to get payment statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get supported currencies
   */
  async getSupportedCurrencies(): Promise<any> {
    try {
      const params = new URLSearchParams({
        api_key: this.apiKey,
      });

      const response = await this.plisioApi.get(`/currencies?${params.toString()}`);
      
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to get currencies');
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to get supported currencies: ${error.message}`);
      throw new HttpException(
        'Failed to get supported currencies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Estimate transaction fee
   */
  async estimateFee(currency: string, addresses: string[]): Promise<any> {
    try {
      const params = new URLSearchParams({
        api_key: this.apiKey,
        currency,
        addresses: addresses.join(','),
      });

      const response = await this.plisioApi.get(`/operations/fee?${params.toString()}`);
      
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to estimate fee');
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to estimate fee: ${error.message}`);
      throw new HttpException(
        'Failed to estimate fee',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
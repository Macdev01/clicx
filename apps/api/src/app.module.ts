import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { TerminusModule } from '@nestjs/terminus';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import * as redisStore from 'cache-manager-redis-store';

// Configuration
import configuration from './config/configuration';
import { DatabaseModule } from './modules/database/database.module';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ModelsModule } from './modules/models/models.module';
import { PostsModule } from './modules/posts/posts.module';
import { MediaModule } from './modules/media/media.module';
import { OrdersModule } from './modules/orders/orders.module';

// Integration Modules
import { BunnyModule } from './integrations/bunny/bunny.module';
import { PlisioModule } from './integrations/plisio/plisio.module';

// Common Modules
import { HealthModule } from './modules/health/health.module';
import { MetricsModule } from './modules/metrics/metrics.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true,
      expandVariables: true,
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get<number>('RATE_LIMIT_TTL', 60),
        limit: config.get<number>('RATE_LIMIT_MAX', 100),
      }),
    }),

    // Caching
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: redisStore,
        host: config.get<string>('REDIS_HOST', 'localhost'),
        port: config.get<number>('REDIS_PORT', 6379),
        ttl: config.get<number>('REDIS_TTL', 3600),
      }),
    }),

    // Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('QUEUE_REDIS_HOST', 'localhost'),
          port: config.get<number>('QUEUE_REDIS_PORT', 6379),
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: config.get<number>('QUEUE_DEFAULT_RETRIES', 3),
          backoff: {
            type: 'exponential',
            delay: config.get<number>('QUEUE_DEFAULT_DELAY', 5000),
          },
        },
      }),
    }),

    // Monitoring
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
      path: '/metrics',
    }),
    TerminusModule,

    // Database
    DatabaseModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    ModelsModule,
    PostsModule,
    MediaModule,
    OrdersModule,

    // Integrations
    BunnyModule,
    PlisioModule,

    // Common
    HealthModule,
    MetricsModule,
  ],
})
export class AppModule {}
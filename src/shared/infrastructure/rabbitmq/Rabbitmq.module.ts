import {
  DynamicModule,
  Global,
  Inject,
  Injectable,
  Logger,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Channel, connect, Connection, Options } from 'amqplib';
import {
  RABBITMQ_CHANNEL,
  RABBITMQ_CONNECTION,
  RABBITMQ_OPTIONS,
} from '../../inject-token/rabbitmq.inject-token';
import { RabbitmqConsumerService } from './RabbitmqConsumer.service';
import { RabbitmqProducerService } from './RabbitmqProducer.service';

export interface RabbitmqModuleOptions {
  url: string;
  exchange?: string;
  exchangeType?: 'direct' | 'topic' | 'fanout' | 'headers';
  queue?: string;
  queueOptions?: Options.AssertQueue;
  prefetch?: number;
}

@Injectable()
export class RabbitmqConnectionService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RabbitmqConnectionService.name);
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  constructor(
    @Inject(RABBITMQ_OPTIONS)
    private readonly options: RabbitmqModuleOptions,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      this.connection = await connect(this.options.url);
      this.channel = await this.connection.createChannel();

      if (this.options.prefetch) {
        await this.channel.prefetch(this.options.prefetch);
      }

      if (this.options.exchange) {
        await this.channel.assertExchange(
          this.options.exchange,
          this.options.exchangeType || 'direct',
          { durable: true },
        );
      }

      if (this.options.queue) {
        await this.channel.assertQueue(
          this.options.queue,
          this.options.queueOptions || { durable: true },
        );
      }

      this.logger.log('RabbitMQ connection established');
    } catch (error) {
      this.logger.error(
        `Failed to connect to RabbitMQ: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('RabbitMQ connection closed');
    } catch (error) {
      this.logger.error(
        `Failed to disconnect from RabbitMQ: ${(error as Error).message}`,
      );
    }
  }

  getChannel(): Channel | null {
    return this.channel;
  }

  getConnection(): Connection | null {
    return this.connection;
  }
}

@Global()
@Module({})
export class RabbitmqModule {
  static forRoot(options: RabbitmqModuleOptions): DynamicModule {
    return {
      module: RabbitmqModule,
      providers: [
        {
          provide: RABBITMQ_OPTIONS,
          useValue: options,
        },
        RabbitmqConnectionService,
        {
          provide: RABBITMQ_CONNECTION,
          useFactory: (connectionService: RabbitmqConnectionService) =>
            connectionService.getConnection(),
          inject: [RabbitmqConnectionService],
        },
        {
          provide: RABBITMQ_CHANNEL,
          useFactory: (connectionService: RabbitmqConnectionService) =>
            connectionService.getChannel(),
          inject: [RabbitmqConnectionService],
        },
        RabbitmqProducerService,
        RabbitmqConsumerService,
      ],
      exports: [
        RabbitmqConnectionService,
        RABBITMQ_CONNECTION,
        RABBITMQ_CHANNEL,
        RabbitmqProducerService,
        RabbitmqConsumerService,
      ],
    };
  }
}

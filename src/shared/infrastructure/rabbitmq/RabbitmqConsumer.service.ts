import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { RabbitmqConnectionService } from './Rabbitmq.module';

export interface ConsumeOptions {
  noAck?: boolean;
  exclusive?: boolean;
}

export type MessageHandler<T> = (message: T, originalMessage: ConsumeMessage) => Promise<void>;

@Injectable()
export class RabbitmqConsumerService {
  private readonly logger = new Logger(RabbitmqConsumerService.name);
  private handlers: Map<string, MessageHandler<unknown>> = new Map();

  constructor(
    private readonly connectionService: RabbitmqConnectionService,
  ) {}

  registerHandler<T>(queue: string, handler: MessageHandler<T>): void {
    this.handlers.set(queue, handler as MessageHandler<unknown>);
  }

  async consume<T>(
    queue: string,
    handler: MessageHandler<T>,
    options?: ConsumeOptions,
  ): Promise<void> {
    const channel = this.connectionService.getChannel();
    if (!channel) {
      this.logger.error('RabbitMQ channel not available');
      return;
    }

    try {
      await channel.consume(
        queue,
        async (msg) => {
          if (!msg) return;

          try {
            const content = JSON.parse(msg.content.toString()) as T;
            await handler(content, msg);

            if (!options?.noAck) {
              channel.ack(msg);
            }
          } catch (error) {
            this.logger.error(`Failed to process message: ${(error as Error).message}`);
            if (!options?.noAck) {
              channel.nack(msg, false, false);
            }
          }
        },
        {
          noAck: options?.noAck ?? false,
          exclusive: options?.exclusive ?? false,
        },
      );

      this.logger.log(`Consumer started for queue: ${queue}`);
    } catch (error) {
      this.logger.error(`Failed to start consumer: ${(error as Error).message}`);
    }
  }
}

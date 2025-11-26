import { Injectable, Logger } from '@nestjs/common';
import { RabbitmqConnectionService } from './Rabbitmq.module';

export interface PublishOptions {
  routingKey?: string;
  persistent?: boolean;
  headers?: Record<string, unknown>;
}

@Injectable()
export class RabbitmqProducerService {
  private readonly logger = new Logger(RabbitmqProducerService.name);

  constructor(
    private readonly connectionService: RabbitmqConnectionService,
  ) {}

  async publish<T>(
    queue: string,
    message: T,
    options?: PublishOptions,
  ): Promise<boolean> {
    const channel = this.connectionService.getChannel();
    if (!channel) {
      this.logger.error('RabbitMQ channel not available');
      return false;
    }

    try {
      const content = Buffer.from(JSON.stringify(message));

      channel.sendToQueue(queue, content, {
        persistent: options?.persistent ?? true,
        headers: options?.headers,
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to publish message: ${(error as Error).message}`);
      return false;
    }
  }

  async publishToExchange<T>(
    exchange: string,
    routingKey: string,
    message: T,
    options?: PublishOptions,
  ): Promise<boolean> {
    const channel = this.connectionService.getChannel();
    if (!channel) {
      this.logger.error('RabbitMQ channel not available');
      return false;
    }

    try {
      const content = Buffer.from(JSON.stringify(message));

      channel.publish(exchange, routingKey, content, {
        persistent: options?.persistent ?? true,
        headers: options?.headers,
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to publish message: ${(error as Error).message}`);
      return false;
    }
  }
}

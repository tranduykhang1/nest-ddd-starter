import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Connection } from 'mongoose';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async databaseHealthCheck(): Promise<void> {
    try {
      const isConnected = this.connection.readyState === 1;
      if (!isConnected) {
        throw new Error('MongoDB connection is not ready');
      }
    } catch (error) {
      this.logger.error(error);
      process.exit(1);
    }
  }
}

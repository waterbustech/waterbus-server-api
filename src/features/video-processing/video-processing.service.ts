import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { EventEmitter } from 'events';
import { RecordUseCases } from '../meeting/record.usecase';
import {
  VideoProcessedMessage,
  VideoProcessingMessage,
} from 'src/core/entities/video-processing';
import { RecordStatus } from 'src/core/enums';
import { EnvironmentConfigService } from 'src/core/config/environment/environments';

@Injectable()
export class VideoProcessingService
  extends EventEmitter
  implements OnModuleInit, OnModuleDestroy
{
  // private readonly sentRecords = new Set<string>();

  constructor(
    private readonly environment: EnvironmentConfigService,
    private readonly recordUseCases: RecordUseCases,
  ) {
    super();
  }
  private readonly logger = new Logger(VideoProcessingService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly processingQueue = 'processing';
  private readonly resultsQueue = 'results';

  // RabbitMQ connection parameters
  private readonly rabbitmqHost = this.environment.getRabbitMQHost();
  private readonly rabbitmqPort = this.environment.getRabbitMQPort();
  private readonly rabbitmqUser = this.environment.getRabbitMQUser();
  private readonly rabbitmqPassword = this.environment.getRabbitMQPassword();

  /**
   * Initialize the connection and start consuming results when the module initializes
   */
  async onModuleInit() {
    await this.connect();
    this.consumeResults();
  }

  /**
   * Establish connection to RabbitMQ and create channel
   */
  private async connect() {
    try {
      this.logger.log('Connecting to RabbitMQ...');
      const connectionParams = {
        protocol: 'amqp',
        hostname: this.rabbitmqHost,
        port: this.rabbitmqPort,
        username: this.rabbitmqUser,
        password: this.rabbitmqPassword,
      };

      this.connection = await amqp.connect(connectionParams);
      this.connection.on('error', (err) => {
        this.logger.error(`RabbitMQ connection error: ${err.message}`);
      });
      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
        // Optionally implement reconnection logic here
      });

      this.channel = await this.connection.createChannel();
      this.channel.on('error', (err) => {
        this.logger.error(`RabbitMQ channel error: ${err.message}`);
      });
      this.channel.on('close', () => {
        this.logger.warn('RabbitMQ channel closed');
      });

      // Declare the 'processing' and 'results' queues
      await this.channel.assertQueue(this.processingQueue, { durable: true });
      await this.channel.assertQueue(this.resultsQueue, { durable: true });

      this.logger.log('Connected to RabbitMQ and queues are asserted.');
    } catch (error) {
      this.logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send a message to the 'processing' queue
   * @param message The message object to send
   */
  async sendToProcessing(message: VideoProcessingMessage): Promise<void> {
    try {
      // if (this.sentRecords.has(message.record_id)) {
      //   this.logger.warn(
      //     `Message with record_id ${message.record_id} already exists in the queue. Skipping...`,
      //   );
      //   return;
      // }

      const msgBuffer = Buffer.from(JSON.stringify(message));
      const sent = this.channel.sendToQueue(this.processingQueue, msgBuffer, {
        persistent: true, // Make message persistent
      });

      if (sent) {
        this.logger.log(
          `Pushed to ['${this.processingQueue}'] queue. Record ID: ${message.record_id}`,
        );
        // this.sentRecords.add(message.record_id);
      } else {
        this.logger.warn(
          `Failed to send message to '${this.processingQueue}' queue. Record ID: ${message.record_id}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error sending message to 'processing' queue: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Set up consumer for the 'results' queue
   */
  private async consumeResults() {
    try {
      await this.channel.consume(
        this.resultsQueue,
        async (msg) => {
          if (msg !== null) {
            const content = msg.content.toString();
            let result: VideoProcessedMessage;
            try {
              result = JSON.parse(content) as VideoProcessedMessage;

              this.logger.log(result);

              const existsRecord = await this.recordUseCases.getRecordById({
                id: Number(result.record_id),
              });

              if (existsRecord && !existsRecord.urlToVideo) {
                existsRecord.urlToVideo = result.video_url;
                existsRecord.duration = result.duration;
                existsRecord.thumbnail = result.thumbnail_url;
                existsRecord.status = RecordStatus.Finish;

                await this.recordUseCases.updateRecord({
                  record: existsRecord,
                });
              }

              // Emit an event with the result
              this.emit('result', result);
            } catch (err) {
              this.logger.error(
                `Failed to parse message from 'results' queue: ${err.message}`,
              );
            }
            // Acknowledge the message
            this.channel.ack(msg);
          }
        },
        { noAck: false },
      );

      this.logger.log(`Consumer set up for '${this.resultsQueue}' queue.`);
    } catch (error) {
      this.logger.error(
        `Error setting up consumer for 'results' queue: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Close the RabbitMQ connection and channel when the module is destroyed
   */
  async onModuleDestroy() {
    try {
      await this.channel.close();
      await this.connection.close();
      this.logger.log('RabbitMQ connection and channel closed.');
    } catch (error) {
      this.logger.error(
        `Error closing RabbitMQ connection/channel: ${error.message}`,
      );
    }
  }
}

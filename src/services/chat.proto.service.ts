import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  BehaviorSubject,
  catchError,
  interval,
  lastValueFrom,
  map,
  retry,
  Subject,
  Subscription,
  switchMap,
  tap,
  throwError,
  timeout,
} from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
import { chat } from 'waterbus-proto';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { ClientService } from 'src/core/enums/grpc/client-service';
import { Message } from 'src/core/entities/message.entity';

@Injectable()
export class ChatGrpcClientService implements OnModuleInit {
  private readonly logger: Logger;
  private chatService: chat.ChatService;
  private $connectionSubject: BehaviorSubject<boolean>;
  private isConnected: boolean;
  private $reconnect: Subscription;

  constructor(private readonly chatClientProxy: ClientGrpc) {
    this.logger = new Logger('ChatService');
  }

  onModuleInit() {
    this.connect();
    this.$connectionSubject = new BehaviorSubject<boolean>(false);
    this.$connectionSubject.subscribe({
      next: (status) => {
        this.isConnected = status;
        if (!status) {
          this.$reconnect = interval(5000)
            .pipe()
            .subscribe({
              next: () => {
                this.logger.log('Retry to connect...');
                this.connect();
                this.checkConnection();
              },
            });
        } else {
          this.$reconnect.unsubscribe();
        }
      },
    });
  }

  connect(): void {
    this.chatService = new ClientService<chat.ChatService>(
      this.chatClientProxy,
      'ChatService',
    ).getInstance();
  }

  private checkConnection(): void {
    this.chatService
      .ping({ message: 'ping' })
      .pipe(timeout(500), retry(3))
      .subscribe({
        next: (result) => {
          this.logger.log('Connected');
          const status = result?.message === 'ping';
          if (this.isConnected !== status) {
            this.$connectionSubject.next(status);
          }
        },
        error: () => {
          if (this.isConnected) this.$connectionSubject.next(false);
        },
      });
  }

  async sendMessage(message: Message): Promise<boolean> {
    const dataSubject = new Subject<chat.MessageResponse>();
    this.$connectionSubject
      .pipe(
        switchMap((isConnected) => {
          if (isConnected) {
            return this.chatService
              .sendMessage(this.convertMessageToMessageRequest(message))
              .pipe(timeout(5000));
          } else
            return throwError(() => ({
              code: Status.UNAVAILABLE,
              message: 'The service is currently unavailable',
            }));
        }),
        catchError((error) => {
          if (
            (error?.code === Status.UNAVAILABLE ||
              error?.name === 'TimeoutError') &&
            this.isConnected
          )
            this.$connectionSubject.next(false);
          return throwError(() => error);
        }),
        tap((data) => dataSubject.next(data)),
        tap(() => dataSubject.complete()),
      )
      .subscribe({
        error: (err) => dataSubject.error(err),
      });
    try {
      return await lastValueFrom(
        dataSubject.pipe(map((response) => response.isSucceed)),
      );
    } catch (error) {
      this.logger.error(error.toString());
    }
  }

  async updateMessage(message: Message): Promise<boolean> {
    const dataSubject = new Subject<chat.MessageResponse>();
    this.$connectionSubject
      .pipe(
        switchMap((isConnected) => {
          if (isConnected) {
            return this.chatService
              .updateMessage(this.convertMessageToMessageRequest(message))
              .pipe(timeout(5000));
          } else
            return throwError(() => ({
              code: Status.UNAVAILABLE,
              message: 'The service is currently unavailable',
            }));
        }),
        catchError((error) => {
          if (
            (error?.code === Status.UNAVAILABLE ||
              error?.name === 'TimeoutError') &&
            this.isConnected
          )
            this.$connectionSubject.next(false);
          return throwError(() => error);
        }),
        tap((data) => dataSubject.next(data)),
        tap(() => dataSubject.complete()),
      )
      .subscribe({
        error: (err) => dataSubject.error(err),
      });
    try {
      return await lastValueFrom(
        dataSubject.pipe(map((response) => response.isSucceed)),
      );
    } catch (error) {
      this.logger.error(error.toString());
    }
  }

  async deleteMessage(message: Message): Promise<boolean> {
    const dataSubject = new Subject<chat.MessageResponse>();
    this.$connectionSubject
      .pipe(
        switchMap((isConnected) => {
          if (isConnected) {
            return this.chatService
              .deleteMessage(this.convertMessageToMessageRequest(message))
              .pipe(timeout(5000));
          } else
            return throwError(() => ({
              code: Status.UNAVAILABLE,
              message: 'The service is currently unavailable',
            }));
        }),
        catchError((error) => {
          if (
            (error?.code === Status.UNAVAILABLE ||
              error?.name === 'TimeoutError') &&
            this.isConnected
          )
            this.$connectionSubject.next(false);
          return throwError(() => error);
        }),
        tap((data) => dataSubject.next(data)),
        tap(() => dataSubject.complete()),
      )
      .subscribe({
        error: (err) => dataSubject.error(err),
      });
    try {
      return await lastValueFrom(
        dataSubject.pipe(map((response) => response.isSucceed)),
      );
    } catch (error) {
      this.logger.error(error.toString());
    }
  }

  private convertMessageToMessageRequest(
    message: Message,
  ): chat.MessageRequest {
    return {
      id: message.id,
      data: message.data,
      type: message.type,
      status: message.status,
      meeting: message.meeting.id,
      createdAt: message.createdAt.getTime(),
      updatedAt: message.updatedAt.getTime(),
      createdBy: {
        id: message.createdBy.id,
        userName: message.createdBy.userName,
        fullName: message.createdBy.fullName,
        avatar: message.createdBy.avatar,
      },
    };
  }
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  BehaviorSubject,
  catchError,
  concatMap,
  interval,
  lastValueFrom,
  map,
  Observable,
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
import { CCUService } from 'src/features/auth/ccu.service';
import { Member } from 'src/core/entities/member.entity';
import { Meeting } from 'src/core/entities/meeting.entity';

@Injectable()
export class ChatGrpcClientService implements OnModuleInit {
  private readonly logger: Logger;
  private chatService: chat.ChatService;
  private $connectionSubject: BehaviorSubject<boolean>;
  private isConnected: boolean;
  private $reconnect: Subscription;

  constructor(
    private readonly chatClientProxy: ClientGrpc,
    private readonly ccuService: CCUService,
  ) {
    this.logger = new Logger(ChatGrpcClientService.name);
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
                // this.logger.log('Retry to connect...');
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
        switchMap(async (isConnected) => {
          if (isConnected) {
            let socketIds = await this.getSocketsInConversation({
              members: message.meeting.members,
            });
            return this.chatService
              .sendMessage(
                this.convertMessageToMessageRequest(message, socketIds),
              )
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
        concatMap((observable: Observable<chat.MessageResponse>) => observable),
        tap((data: chat.MessageResponse) => dataSubject.next(data)),
        tap(() => dataSubject.complete()),
      )
      .subscribe({
        error: (err) => dataSubject.error(err),
      });
    try {
      return await lastValueFrom(
        dataSubject.pipe(map((response) => response.succeed)),
      );
    } catch (error) {
      this.logger.error(error.toString());
    }
  }

  async updateMessage(message: Message): Promise<boolean> {
    const dataSubject = new Subject<chat.MessageResponse>();
    this.$connectionSubject
      .pipe(
        switchMap(async (isConnected) => {
          if (isConnected) {
            let socketIds = await this.getSocketsInConversation({
              members: message.meeting.members,
            });

            return this.chatService
              .updateMessage(
                this.convertMessageToMessageRequest(message, socketIds),
              )
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
        concatMap((observable: Observable<chat.MessageResponse>) => observable),
        tap((data: chat.MessageResponse) => dataSubject.next(data)),
        tap(() => dataSubject.complete()),
      )
      .subscribe({
        error: (err) => dataSubject.error(err),
      });
    try {
      return await lastValueFrom(
        dataSubject.pipe(map((response) => response.succeed)),
      );
    } catch (error) {
      this.logger.error(error.toString());
    }
  }

  async deleteMessage(message: Message): Promise<boolean> {
    const dataSubject = new Subject<chat.MessageResponse>();
    this.$connectionSubject
      .pipe(
        switchMap(async (isConnected) => {
          if (isConnected) {
            let socketIds = await this.getSocketsInConversation({
              members: message.meeting.members,
            });

            return this.chatService
              .deleteMessage(
                this.convertMessageToMessageRequest(message, socketIds),
              )
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
        concatMap((observable: Observable<chat.MessageResponse>) => observable),
        tap((data: chat.MessageResponse) => dataSubject.next(data)),
        tap(() => dataSubject.complete()),
      )
      .subscribe({
        error: (err) => dataSubject.error(err),
      });
    try {
      return await lastValueFrom(
        dataSubject.pipe(map((response) => response.succeed)),
      );
    } catch (error) {
      this.logger.error(error.toString());
    }
  }

  async newMemberJoined({
    meeting,
    member,
  }: {
    meeting: Meeting;
    member: Member;
  }): Promise<boolean> {
    const dataSubject = new Subject<chat.MessageResponse>();
    this.$connectionSubject
      .pipe(
        switchMap(async (isConnected) => {
          if (isConnected) {
            let socketIds = await this.getSocketsInConversation({
              members: meeting.members,
            });
            return this.chatService
              .newMemberJoined({
                meetingId: meeting.id,
                member: {
                  id: member.id,
                  role: member.role,
                  status: member.status,
                  user: {
                    id: member.user.id,
                    userName: member.user.userName,
                    fullName: member.user.fullName,
                    avatar: member.user.avatar,
                  },
                },
                ccus: socketIds,
              })
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
        concatMap((observable: Observable<chat.MessageResponse>) => observable),
        tap((data: chat.MessageResponse) => dataSubject.next(data)),
        tap(() => dataSubject.complete()),
      )
      .subscribe({
        error: (err) => dataSubject.error(err),
      });
    try {
      return await lastValueFrom(
        dataSubject.pipe(map((response) => response.succeed)),
      );
    } catch (error) {
      this.logger.error(error.toString());
    }
  }

  async newInvitation({
    meeting,
    member,
  }: {
    meeting: Meeting;
    member: Member;
  }): Promise<boolean> {
    const dataSubject = new Subject<chat.MessageResponse>();
    this.$connectionSubject
      .pipe(
        switchMap(async (isConnected) => {
          if (isConnected) {
            let socketIds = await this.getSocketsInConversation({
              members: [member],
            });
            return this.chatService
              .newInvitation({
                room: {
                  id: meeting.id,
                  title: meeting.title,
                  status: meeting.status,
                  avatar: meeting.avatar,
                  createdAt: meeting.createdAt.getTime().toString(),
                  members: [],
                },
                ccus: socketIds,
              })
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
        concatMap((observable: Observable<chat.MessageResponse>) => observable),
        tap((data: chat.MessageResponse) => dataSubject.next(data)),
        tap(() => dataSubject.complete()),
      )
      .subscribe({
        error: (err) => dataSubject.error(err),
      });
    try {
      return await lastValueFrom(
        dataSubject.pipe(map((response) => response.succeed)),
      );
    } catch (error) {
      this.logger.error(error.toString());
    }
  }

  private async getSocketsInConversation({
    members,
  }: {
    members: Member[];
  }): Promise<string[]> {
    let userIds = members.map((member) => member.user.id);
    let ccus = await this.ccuService.findByUserIds({ userIds });
    let ccusStr = ccus.map((ccu) => ccu.socketId);

    return ccusStr;
  }

  private convertMessageToMessageRequest(
    message: Message,
    ccus: string[],
  ): chat.MessageRequest {
    return {
      id: message.id,
      data: message.data,
      type: message.type,
      status: message.status,
      meeting: message.meeting.id,
      ccus: ccus,
      createdAt: message.createdAt.getTime().toString(),
      updatedAt: message.updatedAt.getTime().toString(),
      createdBy: {
        id: message.createdBy.id,
        userName: message.createdBy.userName,
        fullName: message.createdBy.fullName,
        avatar: message.createdBy.avatar,
      },
    };
  }
}

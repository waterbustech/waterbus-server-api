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
import { recordtrack } from 'waterbus-proto';
import { Status } from '@grpc/grpc-js/build/src/constants';
import { ClientService } from 'src/core/client-proxy/client-service';

@Injectable()
export class RecordGrpcService implements OnModuleInit {
  private readonly logger: Logger;
  private recordService: recordtrack.RecordService;
  private $connectionSubject: BehaviorSubject<boolean>;
  private isConnected: boolean;
  private $reconnect: Subscription;

  constructor(private readonly recordClientProxy: ClientGrpc) {
    this.logger = new Logger(RecordGrpcService.name);
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
    this.recordService = new ClientService<recordtrack.RecordService>(
      this.recordClientProxy,
      'RecordService',
    ).getInstance();
  }

  private checkConnection(): void {
    this.recordService
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

  async startRecord(
    data: recordtrack.StartRecordRequest,
  ): Promise<recordtrack.RecordResponse> {
    const dataSubject = new Subject<recordtrack.RecordResponse>();
    this.$connectionSubject
      .pipe(
        switchMap((isConnected) => {
          if (isConnected) {
            return this.recordService.startRecord(data).pipe(timeout(5000));
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
      return await lastValueFrom(dataSubject.pipe(map((response) => response)));
    } catch (error) {
      this.logger.error(error.toString());
    }
  }

  async stopRecord(
    data: recordtrack.StopRecordRequest,
  ): Promise<recordtrack.RecordResponse> {
    const dataSubject = new Subject<recordtrack.RecordResponse>();
    this.$connectionSubject
      .pipe(
        switchMap((isConnected) => {
          if (isConnected) {
            return this.recordService.stopRecord(data).pipe(timeout(5000));
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
      return await lastValueFrom(dataSubject.pipe(map((response) => response)));
    } catch (error) {
      this.logger.error(error.toString());
    }
  }
}

import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { recordtrack } from 'waterbus-proto';
import { RecordUseCases } from './record.usecase';

@Controller()
export class RecordGrpcController implements recordtrack.RecordService {
  constructor(private readonly recordUseCases: RecordUseCases) {}

  @GrpcMethod('RecordService', 'ping')
  ping(payload: any) {
    return payload;
  }

  @GrpcMethod('RecordService', 'startBoard')
  startRecord(
    data: recordtrack.StartRecordRequest,
  ): Observable<recordtrack.RecordResponse> {
    return new Observable<recordtrack.RecordResponse>((observer) => {
      this.recordUseCases
        .startRecord({ userId: data.userId, meetingId: data.meetingId })
        .then((record) => {
          const response: recordtrack.RecordResponse = {
            succeed: true,
            recordId: record.id,
          };
          observer.next(response);
          observer.complete();
        })
        .catch((error) => {
          const response: recordtrack.RecordResponse = {
            succeed: false,
            recordId: null,
          };
          observer.next(response);
          observer.complete();
        });
    });
  }

  @GrpcMethod('RecordService', 'stopRecord')
  stopRecord(
    data: recordtrack.StopRecordRequest,
  ): Observable<recordtrack.RecordResponse> {
    return new Observable<recordtrack.RecordResponse>((observer) => {
      this.recordUseCases
        .stopRecord(data)
        .then((record) => {
          const response: recordtrack.RecordResponse = {
            succeed: true,
            recordId: data.recordId,
          };
          observer.next(response);
          observer.complete();
        })
        .catch((error) => {
          const response: recordtrack.RecordResponse = {
            succeed: false,
            recordId: data.recordId,
          };
          observer.next(response);
          observer.complete();
        });
    });
  }
}

import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { meeting } from 'waterbus-proto';
import { MeetingsUseCases } from '../meetings/meetings.usecase';
import { Observable } from 'rxjs';

@Controller()
export class MeetingGrpcController implements meeting.MeetingService {
  constructor(private meetingsUseCases: MeetingsUseCases) {}

  @GrpcMethod('MeetingService', 'ping')
  ping(payload: any) {
    return payload;
  }

  @GrpcMethod('MeetingService', 'leaveRoom')
  leaveRoom(
    data: meeting.LeaveRoomRequest,
  ): Observable<meeting.LeaveRoomResponse> {
    const roomId = data.roomId;
    const participantId = data.participantId;

    try {
      this.meetingsUseCases.leaveRoom(Number(roomId), Number(participantId));

      const response: meeting.LeaveRoomResponse = {
        succeed: true,
      };

      return new Observable<meeting.LeaveRoomResponse>((observer) => {
        observer.next(response);
        observer.complete();
      });
    } catch (error) {
      const response: meeting.LeaveRoomResponse = {
        succeed: false,
      };

      return new Observable<meeting.LeaveRoomResponse>((observer) => {
        observer.next(response);
        observer.complete();
      });
    }
  }
}

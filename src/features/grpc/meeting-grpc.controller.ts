import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { meeting } from '../../proto/meeting';
import { MeetingsUseCases } from '../meetings/meetings.usecase';

@Controller()
export class MeetingGrpcController implements meeting.MeetingService {
  constructor(private meetingsUseCases: MeetingsUseCases) {}

  @GrpcMethod('MeetingService', 'leaveRoom')
  leaveRoom(
    data: meeting.LeaveRoomRequest,
    _: Metadata,
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

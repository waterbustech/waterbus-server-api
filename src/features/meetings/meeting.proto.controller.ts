import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { meeting } from 'waterbus-proto';
import { MeetingsUseCases } from './meetings.usecase';
import { Observable, catchError, throwError } from 'rxjs';

@Controller()
export class MeetingGrpcController implements meeting.MeetingService {
  constructor(private meetingsUseCases: MeetingsUseCases) {}

  @GrpcMethod('MeetingService', 'ping')
  ping(payload: any) {
    return payload;
  }

  @GrpcMethod('MeetingService', 'getParticipantById')
  getParticipantById(
    request: meeting.GetParticipantRequest,
  ): Observable<meeting.GetParticipantResponse> {
    const participantId = Number(request.participantId);
    console.log(`participantId: ${participantId}`);
    const participant$ = new Observable<meeting.GetParticipantResponse>(
      (observer) => {
        this.meetingsUseCases
          .getParticipantById(participantId)
          .then((participant) => {
            const response: meeting.GetParticipantResponse = {
              id: participant.id,
              user: {
                id: participant.user.id,
                userName: participant.user.userName,
                fullName: participant.user.fullName,
                avatar: participant.user.avatar,
              },
            };

            observer.next(response);
            observer.complete();
          })
          .catch((error) => {
            observer.error(error);
            observer.complete();
          });
      },
    );

    return participant$.pipe(
      catchError((error: any) => {
        return throwError(error);
      }),
    );
  }

  @GrpcMethod('MeetingService', 'leaveRoom')
  leaveRoom(
    data: meeting.LeaveRoomRequest,
  ): Observable<meeting.LeaveRoomResponse> {
    const roomId = data.roomId;
    const participantId = data.participantId;

    try {
      this.meetingsUseCases.removeParticipant(
        Number(roomId),
        Number(participantId),
      );

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

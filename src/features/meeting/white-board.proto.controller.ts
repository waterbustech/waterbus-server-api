import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { whiteboard } from 'waterbus-proto';
import { WhiteBoardUseCases } from './white-board.usecase';

@Controller()
export class WhiteBoardGrpcController implements whiteboard.WhiteBoardService {
  constructor(private readonly whiteBoardUseCases: WhiteBoardUseCases) {}

  @GrpcMethod('WhiteBoardService', 'ping')
  ping(payload: any) {
    return payload;
  }

  @GrpcMethod('WhiteBoardService', 'getBoard')
  getBoard(
    data: whiteboard.GetWhiteBoardRequest,
  ): Observable<whiteboard.WhiteBoardResponse> {
    return new Observable<whiteboard.WhiteBoardResponse>((observer) => {
      this.whiteBoardUseCases
        .getBoardByMeeting(data.meetingId)
        .then((whiteBoard) => {
          const response: whiteboard.WhiteBoardResponse = {
            succeed: true,
            paints: whiteBoard.paints,
          };
          observer.next(response);
          observer.complete();
        })
        .catch((error) => {
          const response: whiteboard.WhiteBoardResponse = {
            succeed: false,
            paints: null,
          };
          observer.next(response);
          observer.complete();
        });
    });
  }

  @GrpcMethod('WhiteBoardService', 'updateBoard')
  updateBoard(
    data: whiteboard.UpdateWhiteBoardRequest,
  ): Observable<whiteboard.WhiteBoardResponse> {
    return new Observable<whiteboard.WhiteBoardResponse>((observer) => {
      this.whiteBoardUseCases
        .updateBoard(data.meetingId, data.paints)
        .then((whiteBoard) => {
          const response: whiteboard.WhiteBoardResponse = {
            succeed: true,
            paints: whiteBoard.paints,
          };
          observer.next(response);
          observer.complete();
        })
        .catch((error) => {
          const response: whiteboard.WhiteBoardResponse = {
            succeed: false,
            paints: null,
          };
          observer.next(response);
          observer.complete();
        });
    });
  }
}

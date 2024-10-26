import { Injectable, NotFoundException } from '@nestjs/common';
import { WhiteBoardService } from './white-board.service';
import { PaintModel, WhiteBoard } from 'src/core/entities/white-board.entity';
import { MeetingService } from './meeting.service';

@Injectable()
export class WhiteBoardUseCases {
  constructor(
    private whiteBoardService: WhiteBoardService,
    private meetingService: MeetingService,
  ) {}

  async getBoardByMeeting(meetingCode: number): Promise<WhiteBoard> {
    let board = await this.whiteBoardService.findOne({
      meeting: { code: meetingCode },
    });

    // if board not exists - create new board
    if (!board) {
      const meeting = await this.meetingService.findOne({
        code: meetingCode,
      });

      if (!meeting) {
        throw new NotFoundException(`Meeting with ID ${meetingCode} not found`);
      }

      board = new WhiteBoard();
      board.meeting = meeting;
      board.paints = [];

      const newBoard = await this.whiteBoardService.create(board);

      return newBoard;
    }

    return board;
  }

  async updateBoard(
    meetingCode: number,
    paints: PaintModel[],
    action: string,
  ): Promise<WhiteBoard> {
    let board = await this.whiteBoardService.findOne({
      meeting: { code: meetingCode },
    });

    if (!board) {
      throw new NotFoundException(
        `White board with ID ${meetingCode} not found`,
      );
    }

    let current = board.paints;

    if (action === 'add') {
      current = [...current, ...paints];
    } else if (action === 'remove') {
      current = current.filter(
        (paint) =>
          !paints.some((p) => JSON.stringify(p) === JSON.stringify(paint)),
      );
    } else {
      current = [];
    }

    board.paints = current;

    const newBoard = await this.whiteBoardService.update(board.id, board);

    return newBoard;
  }
}

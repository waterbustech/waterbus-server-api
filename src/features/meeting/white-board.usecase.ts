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

  async getBoardByMeeting(meetingId: number): Promise<WhiteBoard> {
    let board = await this.whiteBoardService.findOne({
      meeting: { id: meetingId },
    });

    // if board not exists - create new board
    if (!board) {
      const meeting = await this.meetingService.findOne({
        id: meetingId,
      });

      if (!meeting) {
        throw new NotFoundException(`Meeting with ID ${meetingId} not found`);
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
    boardId: number,
    paints: PaintModel[],
  ): Promise<WhiteBoard> {
    let board = await this.whiteBoardService.findOne({ id: boardId });

    if (!board) {
      throw new NotFoundException(`White board with ID ${boardId} not found`);
    }

    board.paints = paints;

    const newBoard = await this.whiteBoardService.update(board.id, board);

    return newBoard;
  }
}

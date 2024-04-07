import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ChatsUseCases } from './chats.usecase';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'chats',
  version: '1',
})
export class ChatsController {
  constructor(
    private chatsUseCases: ChatsUseCases, // private meetingFactoryService: MeetingFactoryService,
  ) {}
}

import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
  Put,
  Delete,
  Body,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { ChatsUseCases } from './chats.usecase';
import { PaginationListQuery, SendMessageDto } from 'src/core/dtos';

@ApiBearerAuth()
@ApiSecurity('api_key', ['api_key'])
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'chats',
  version: '1',
})
export class ChatsController {
  constructor(private chatsUseCases: ChatsUseCases) {}

  @Get(':meetingId')
  async getMessagesByMeeting(
    @Request() request,
    @Param('meetingId') meetingId: number,
    @Query() query: PaginationListQuery,
  ) {
    return this.chatsUseCases.getMessagesByMeeting({
      userId: request.user.id,
      meetingId,
      query,
    });
  }

  @Post(':meetingId')
  async sendMessageByMeeting(
    @Request() request,
    @Param('meetingId') meetingId: number,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.chatsUseCases.createMessage({
      userId: request.user.id,
      meetingId,
      data: sendMessageDto.data,
    });
  }

  @Put(':messageId')
  async editMessageById(
    @Request() request,
    @Param('messageId') messageId: number,
    @Body() editMessageDto: SendMessageDto,
  ) {
    return this.chatsUseCases.updateMessage({
      userId: request.user.id,
      messageId,
      data: editMessageDto.data,
    });
  }

  @Delete(':messageId')
  async deleteMessageById(
    @Request() request,
    @Param('messageId') messageId: number,
  ) {
    return this.chatsUseCases.deleteMessage({
      userId: request.user.id,
      messageId,
    });
  }

  @Delete('/conversations/:meetingId')
  async deleteConversationByMeetingId(
    @Request() request,
    @Param('meetingId') meetingId: number,
  ) {
    return this.chatsUseCases.deleteConversation({
      userId: request.user.id,
      meetingId,
    });
  }
}

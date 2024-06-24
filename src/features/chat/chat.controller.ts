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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ChatUseCases } from './chat.usecase';
import { PaginationListQuery, SendMessageDto } from 'src/core/dtos';

@ApiTags('chat')
@ApiBearerAuth()
@ApiSecurity('api-key', ['api-key'])
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'chats',
  version: '1',
})
export class ChatController {
  constructor(private chatUseCases: ChatUseCases) {}

  @ApiOperation({
    summary: 'Get messages by room',
    description: 'Get messages by room id',
  })
  @Get(':meetingId')
  async getMessagesByMeeting(
    @Request() request,
    @Param('meetingId') meetingId: number,
    @Query() query: PaginationListQuery,
  ) {
    return this.chatUseCases.getMessagesByMeeting({
      userId: request.user.id,
      meetingId,
      query,
    });
  }

  @ApiOperation({
    summary: 'Send message',
    description: 'Send an encrypted message',
  })
  @Post(':meetingId')
  async sendMessageByMeeting(
    @Request() request,
    @Param('meetingId') meetingId: number,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.chatUseCases.createMessage({
      userId: request.user.id,
      meetingId,
      data: sendMessageDto.data,
    });
  }

  @ApiOperation({
    summary: 'Update message',
    description: 'Update an encrypted message',
  })
  @Put(':messageId')
  async editMessageById(
    @Request() request,
    @Param('messageId') messageId: number,
    @Body() editMessageDto: SendMessageDto,
  ) {
    return this.chatUseCases.updateMessage({
      userId: request.user.id,
      messageId,
      data: editMessageDto.data,
    });
  }

  @ApiOperation({ summary: 'Delete message', description: 'Delete message' })
  @Delete(':messageId')
  async deleteMessageById(
    @Request() request,
    @Param('messageId') messageId: number,
  ) {
    return this.chatUseCases.deleteMessage({
      userId: request.user.id,
      messageId,
    });
  }

  @ApiOperation({
    summary: 'Delete conversation',
    description: 'Delete conversation only you and no one else',
  })
  @Delete('/conversations/:meetingId')
  async deleteConversationByMeetingId(
    @Request() request,
    @Param('meetingId') meetingId: number,
  ) {
    return this.chatUseCases.deleteConversation({
      userId: request.user.id,
      meetingId,
    });
  }
}

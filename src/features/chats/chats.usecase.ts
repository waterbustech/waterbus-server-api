import { Injectable } from '@nestjs/common';
import { ChatsService } from './chats.service';

@Injectable()
export class ChatsUseCases {
  constructor(private chatServices: ChatsService) {}
}

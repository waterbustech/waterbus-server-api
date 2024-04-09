import { Test, TestingModule } from '@nestjs/testing';
import { ChatsController } from './chats.controller';
import { MeetingsUseCases } from '../meetings/meetings.usecase';
import { ChatsUseCases } from './chats.usecase';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Message } from 'src/core/entities/message.entity';

describe('ChatsController', () => {
  let controller: ChatsController;
  let mockChatsUseCases: ChatsUseCases;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatsController],
      providers: [
        {
          provide: ChatsUseCases,
          useValue: mockChatsUseCases,
        },
      ],
    }).compile();

    controller = module.get<ChatsController>(ChatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

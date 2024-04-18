import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatUseCases } from './chat.usecase';
import { UserUseCases } from '../user/user.usecase';

describe('ChatsController', () => {
  let controller: ChatController;
  let mockChatsUseCases: ChatUseCases;
  let mockUserUseCases: UserUseCases;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatUseCases,
          useValue: mockChatsUseCases,
        },
        {
          provide: UserUseCases,
          useValue: mockUserUseCases,
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

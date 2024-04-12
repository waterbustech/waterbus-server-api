import { Test, TestingModule } from '@nestjs/testing';
import { ChatsController } from './chats.controller';
import { ChatsUseCases } from './chats.usecase';
import { UserUseCases } from '../users/user.usecase';

describe('ChatsController', () => {
  let controller: ChatsController;
  let mockChatsUseCases: ChatsUseCases;
  let mockUserUseCases: UserUseCases;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatsController],
      providers: [
        {
          provide: ChatsUseCases,
          useValue: mockChatsUseCases,
        },
        {
          provide: UserUseCases,
          useValue: mockUserUseCases,
        },
      ],
    }).compile();

    controller = module.get<ChatsController>(ChatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ChatsController } from './chats.controller';
import { ChatsUseCases } from './chats.usecase';

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

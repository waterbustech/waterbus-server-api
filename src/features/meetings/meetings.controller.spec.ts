import { Test, TestingModule } from '@nestjs/testing';
import { MeetingsController } from './meetings.controller';
import { MeetingsUseCases } from './meetings.usecase';
import { MeetingFactoryService } from './meetings-factory.service';
import { UsersService } from '../users/users.service';
import { CreateMeetingDto, UpdateMeetingDto } from 'src/core/dtos';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from '@nestjs/common';

describe('MeetingsController', () => {
  let meetingsController: MeetingsController;
  let meetingsUseCases: MeetingsUseCases;
  let userService: UsersService;
  let meetingFactoryService: MeetingFactoryService;

  const mockMeetingsUseCases = {
    getRoomByCode: jest.fn(),
    createRoom: jest.fn(),
    updateRoom: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  const mockMeetingFactoryService = {
    createNewRoom: jest.fn(),
    getRoomFromUpdateDto: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingsController],
      providers: [
        {
          provide: MeetingsUseCases,
          useValue: mockMeetingsUseCases,
        },
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: MeetingFactoryService,
          useValue: mockMeetingFactoryService,
        },
      ],
    }).compile();

    meetingsController = module.get<MeetingsController>(MeetingsController);
    meetingsUseCases = module.get<MeetingsUseCases>(MeetingsUseCases);
    userService = module.get<UsersService>(UsersService);
    meetingFactoryService = module.get<MeetingFactoryService>(
      MeetingFactoryService,
    );
  });

  describe('getRoomByCode', () => {
    it('should return a room when given a code', async () => {
      const mockRoom = {}; // Mock your room object here
      const mockCode = 123;

      mockMeetingsUseCases.getRoomByCode.mockResolvedValue(mockRoom);

      const result = await meetingsController.getRoomByCode(mockCode);

      expect(result).toBe(mockRoom);
    });
  });

  describe('createRoom', () => {
    it('should create a room and return the result', async () => {
      const mockUser = {}; // Mock your user object here
      const mockCreateRoomDto: CreateMeetingDto = {
        title: '123',
        password: '123',
      }; // Mock your create room DTO here
      const mockRoom = {}; // Mock your room object here

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockMeetingFactoryService.createNewRoom.mockReturnValue(mockRoom);
      mockMeetingsUseCases.createRoom.mockResolvedValue(mockRoom);

      const mockRequest = { user: { id: 1 } };

      const result = await meetingsController.createRoom(
        mockRequest,
        mockCreateRoomDto,
      );

      expect(result).toBe(mockRoom);
    });
  });

  describe('updateRoom', () => {
    it('should update a room and return the result', async () => {
      const mockRoom = {}; // Mock your room object here
      const mockUpdateRoomDto: UpdateMeetingDto = {
        title: '123',
        password: '123',
        code: 123,
      }; // Mock your update room DTO here

      mockMeetingFactoryService.getRoomFromUpdateDto.mockReturnValue(mockRoom);
      mockMeetingsUseCases.updateRoom.mockResolvedValue(mockRoom);

      const mockRequest = { user: { id: 1 } };

      const result = await meetingsController.updateRoom(
        mockRequest,
        mockUpdateRoomDto,
      );

      expect(result).toBe(mockRoom);
    });
  });
});

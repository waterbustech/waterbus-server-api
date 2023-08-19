import { Test, TestingModule } from '@nestjs/testing';
import { MeetingsController } from './meetings.controller';
import { MeetingsUseCases } from './meetings.usecase';
import { MeetingFactoryService } from './meetings-factory.service';
import { UsersService } from '../users/users.service';
import { CreateMeetingDto, UpdateMeetingDto } from 'src/core/dtos';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Participant } from '../../core/entities/participant.entity';
import { Repository } from 'typeorm';

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

  const mockParticipantsRepository = {
    save: jest.fn(),
    create: jest.fn(),
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
        {
          provide: getRepositoryToken(Participant),
          useValue: mockParticipantsRepository,
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
      // Arrange
      const mockRoom = {}; // Mock your room object here
      const mockCode = 123;
      mockMeetingsUseCases.getRoomByCode.mockResolvedValue(mockRoom);

      // Act
      const result = await meetingsController.getRoomByCode(mockCode);

      // Assert
      expect(result).toBe(mockRoom);
      expect(mockMeetingsUseCases.getRoomByCode).toHaveBeenCalledWith(mockCode);
    });
  });

  describe('createRoom', () => {
    it('should create a room and return the result', async () => {
      // Arrange
      const mockUser = {}; // Mock your user object here
      const mockCreateRoomDto: CreateMeetingDto = {
        title: '123',
        password: '123',
      }; // Mock your create room DTO here
      const mockRoom = {}; // Mock your room object here
      const mockRequest = { user: { id: 1 } };
      const mockParticipant = { user: mockUser, role: 0 };

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockMeetingFactoryService.createNewRoom.mockReturnValue(mockRoom);
      mockMeetingsUseCases.createRoom.mockResolvedValue(mockRoom);
      mockParticipantsRepository.save.mockResolvedValue(mockParticipant);

      // Act
      const result = await meetingsController.createRoom(
        mockRequest,
        mockCreateRoomDto,
      );

      // Assert
      expect(result).toBe(mockRoom);
      expect(mockUserService.findOne).toHaveBeenCalledWith({
        id: mockRequest.user.id,
      });
      expect(mockMeetingFactoryService.createNewRoom).toHaveBeenCalledWith(
        mockCreateRoomDto,
        expect.any(Object), // You may need to adjust this to match the expected Participant object
      );
      expect(mockMeetingsUseCases.createRoom).toHaveBeenCalledWith(mockRoom);
    });
  });

  describe('updateRoom', () => {
    it('should update a room and return the result', async () => {
      // Arrange
      const mockRoom = {}; // Mock your room object here
      const mockUpdateRoomDto: UpdateMeetingDto = {
        title: '123',
        password: '123',
        code: 123,
      }; // Mock your update room DTO here
      const mockRequest = { user: { id: 1 } };

      mockMeetingFactoryService.getRoomFromUpdateDto.mockReturnValue(mockRoom);
      mockMeetingsUseCases.updateRoom.mockResolvedValue(mockRoom);

      // Act
      const result = await meetingsController.updateRoom(
        mockRequest,
        mockUpdateRoomDto,
      );

      // Assert
      expect(result).toBe(mockRoom);
      expect(
        mockMeetingFactoryService.getRoomFromUpdateDto,
      ).toHaveBeenCalledWith(mockUpdateRoomDto);
      expect(mockMeetingsUseCases.updateRoom).toHaveBeenCalledWith(
        mockRequest.user.id,
        mockRoom,
      );
    });
  });
});

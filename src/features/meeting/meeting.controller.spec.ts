import { Test, TestingModule } from '@nestjs/testing';
import { MeetingController } from './meeting.controller';
import { MeetingUseCases } from './meeting.usecase';
import { MeetingFactoryService } from './meeting-factory.service';
import { CreateMeetingDto, UpdateMeetingDto } from 'src/core/dtos';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Participant } from '../../core/entities/participant.entity';
import { Member } from '../../core/entities/member.entity';
import { UserUseCases } from '../user/user.usecase';
import { RecordUseCases } from './record.usecase';

describe('MeetingsController', () => {
  let meetingsController: MeetingController;
  let meetingsUseCases: MeetingUseCases;
  let userUseCases: UserUseCases;
  let meetingFactoryService: MeetingFactoryService;

  const mockMeetingsUseCases = {
    getRoomByCode: jest.fn(),
    createRoom: jest.fn(),
    updateRoom: jest.fn(),
  };

  const mockUserUseCases = {
    getUserById: jest.fn(),
  };

  const mockRecordUseCases = {};

  const mockMeetingFactoryService = {
    createNewRoom: jest.fn(),
    getRoomFromUpdateDto: jest.fn(),
  };

  const mockParticipantsRepository = {
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockMembersRepository = {
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingController],
      providers: [
        {
          provide: MeetingUseCases,
          useValue: mockMeetingsUseCases,
        },
        {
          provide: UserUseCases,
          useValue: mockUserUseCases,
        },
        {
          provide: RecordUseCases,
          useValue: mockRecordUseCases,
        },
        {
          provide: MeetingFactoryService,
          useValue: mockMeetingFactoryService,
        },
        {
          provide: getRepositoryToken(Participant),
          useValue: mockParticipantsRepository,
        },
        {
          provide: getRepositoryToken(Member),
          useValue: mockMembersRepository,
        },
      ],
    }).compile();

    meetingsController = module.get<MeetingController>(MeetingController);
    meetingsUseCases = module.get<MeetingUseCases>(MeetingUseCases);
    userUseCases = module.get<UserUseCases>(UserUseCases);
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
      const mockUser = {};
      const mockCreateRoomDto: CreateMeetingDto = {
        title: '123',
        password: '123',
      };
      const mockRoom = {};
      const mockRequest = { user: { id: 1 } };
      const mockMember = { user: mockUser, role: 0 };

      mockUserUseCases.getUserById.mockResolvedValue(mockUser);
      mockMeetingFactoryService.createNewRoom.mockReturnValue(mockRoom);
      mockMeetingsUseCases.createRoom.mockResolvedValue(mockRoom);
      mockMembersRepository.save.mockResolvedValue(mockMember);

      // Act
      const result = await meetingsController.createRoom(
        mockRequest,
        mockCreateRoomDto,
      );

      // Assert
      expect(result).toBe(mockRoom);
      expect(mockUserUseCases.getUserById).toHaveBeenCalledWith(
        mockRequest.user.id,
      );
      expect(mockMeetingFactoryService.createNewRoom).toHaveBeenCalledWith({
        room: mockCreateRoomDto,
        member: expect.any(Object),
      });
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
        avatar: 'https://waterbus.tech/lambiengcode.png',
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

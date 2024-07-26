import { Test, TestingModule } from '@nestjs/testing';
import { MeetingUseCases } from './meeting.usecase';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Participant } from '../../core/entities/participant.entity';
import { Member } from '../../core/entities/member.entity';
import { UserUseCases } from '../user/user.usecase';
import { MeetingService } from './meeting.service';
import { ParticipantService } from './participant.service';
import { CCU } from 'src/core/entities/ccu.entity';
import { Meeting } from 'src/core/entities/meeting.entity';
import { MeetingStatus } from 'src/core/enums/meeting';
import { User } from 'src/core/entities';
import { Message } from 'src/core/entities/message.entity';
import { MemberRole, MemberStatus } from 'src/core/enums/member';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Status } from 'src/core/enums';
import bcrypt from 'bcryptjs';

describe('MeetingUseCase', () => {
  let meetingUseCases: MeetingUseCases;

  const mockMeetingService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockUserUseCases = {
    getUserById: jest.fn(),
  };

  const mockParticipantService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockCCURepository = {
    save: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    fullName: 'Alice',
    userName: 'alice',
    createdAt: undefined,
    updatedAt: undefined,
    deletedAt: undefined,
    lastSeenAt: undefined,
    participant: new Participant(),
    message: new Message(),
    generateUserName: jest.fn(),
    setEntityName: jest.fn(),
    toJSON: jest.fn(),
    hasId: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
    recover: jest.fn(),
    reload: jest.fn(),
  };

  const mockMember: Member = {
    user: mockUser,
    id: 0,
    meeting: new Meeting(),
    role: MemberRole.Host,
    status: MemberStatus.Joined,
    createdAt: undefined,
    deletedAt: undefined,
    softDeletedAt: undefined,
    setEntityName: jest.fn(),
    toJSON: jest.fn(),
    hasId: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
    recover: jest.fn(),
    reload: jest.fn(),
  };

  const mockParticipant: Participant = {
    user: mockUser,
    id: 0,
    meeting: new Meeting(),
    ccu: null,
    status: Status.Active,
    createdAt: undefined,
    deletedAt: undefined,
    setEntityName: jest.fn(),
    toJSON: jest.fn(),
    hasId: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
    recover: jest.fn(),
    reload: jest.fn(),
  };

  const mockRoom: Meeting = {
    id: 1,
    title: 'Meeting with Alice',
    code: 123,
    password: '123',
    members: [mockMember],
    participants: [],
    setPassword: jest.fn(),
    createdAt: undefined,
    updatedAt: undefined,
    deletedAt: undefined,
    latestMessage: null,
    message: null,
    generateCode: jest.fn(),
    setEntityName: jest.fn(),
    toJSON: jest.fn(),
    hasId: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
    recover: jest.fn(),
    reload: jest.fn(),
    status: MeetingStatus.Active,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingUseCases,
        {
          provide: UserUseCases,
          useValue: mockUserUseCases,
        },
        {
          provide: MeetingService,
          useValue: mockMeetingService,
        },
        {
          provide: ParticipantService,
          useValue: mockParticipantService,
        },
        {
          provide: getRepositoryToken(CCU),
          useValue: mockCCURepository,
        },
      ],
    }).compile();

    meetingUseCases = module.get<MeetingUseCases>(MeetingUseCases);
  });

  describe('getRoomsByUserId', () => {
    it('should return array of room when given a user id', async () => {
      // Arrange
      const mockQuery = {
        userId: 1,
        status: 2,
        query: {
          skip: 0,
          limit: 10,
          page: 0,
          perPage: 10,
        },
      };

      mockMeetingService.findAll.mockResolvedValue(mockRoom);

      // Act
      const result = await meetingUseCases.getRoomsByUserId(mockQuery);

      // Assert
      expect(result).toBe(mockRoom);
      expect(mockMeetingService.findAll).toHaveBeenCalledWith(mockQuery);
    });
  });

  describe('getRoomById', () => {
    it('should return a room when given a room id', async () => {
      // Arrange
      const mockMeetingId = 1;

      mockMeetingService.findOne.mockResolvedValue(mockRoom);

      // Act
      const result = await meetingUseCases.getRoomById(mockMeetingId);

      // Assert
      expect(result).toBe(mockRoom);
      expect(mockMeetingService.findOne).toHaveBeenCalledWith({
        id: mockMeetingId,
      });
    });
  });

  describe('getRoomByCode', () => {
    it('should return a room when given a code', async () => {
      // Arrange
      const mockCode = 123;

      mockMeetingService.findOne.mockResolvedValue(mockRoom);

      // Act
      const result = await meetingUseCases.getRoomByCode(mockCode);

      // Assert
      expect(result).toBe(mockRoom);
      expect(mockMeetingService.findOne).toHaveBeenCalledWith({
        code: mockCode,
      });
    });
  });

  describe('create a room', () => {
    it('should return a new room', async () => {
      // Arrange
      mockMeetingService.create.mockResolvedValue(mockRoom);

      // Act
      const result = await meetingUseCases.createRoom(mockRoom);

      // Assert
      expect(result).toBe(mockRoom);
      expect(mockMeetingService.create).toHaveBeenCalledWith(mockRoom);
    });
  });

  describe('update a room', () => {
    it('should return a updated room', async () => {
      // Arrange
      mockMeetingService.findOne.mockResolvedValue(mockRoom);
      mockMeetingService.update.mockResolvedValue(mockRoom);
      const mockUserId = 1;

      // Act
      const result = await meetingUseCases.updateRoom(mockUserId, mockRoom);

      // Assert
      expect(result).toBe(mockRoom);
      expect(mockMeetingService.findOne).toHaveBeenCalledWith({
        code: mockRoom.code,
      });
      expect(mockMeetingService.update).toHaveBeenCalledWith(
        mockRoom.id,
        mockRoom,
      );
    });

    it('should throw error - not found room', async () => {
      // Arrange
      mockMeetingService.findOne.mockResolvedValue(null);
      const mockUserId = 1;

      try {
        // Act
        await meetingUseCases.updateRoom(mockUserId, mockRoom);
        // If the above line doesn't throw an error, fail the test
        fail('updateRoom did not throw NotFoundException');
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Room Not Found');
        expect(mockMeetingService.findOne).toHaveBeenCalledWith({
          code: mockRoom.code,
        });
      }
    });

    it('should throw error - user not allowed to update room', async () => {
      // Arrange
      mockMeetingService.findOne.mockResolvedValue(mockRoom);
      const mockUserId = 2;

      try {
        // Act
        await meetingUseCases.updateRoom(mockUserId, mockRoom);
        // If the above line doesn't throw an error, fail the test
        fail('updateRoom did not throw ForbiddenException');
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('User not allowed to update rooom');
        expect(mockMeetingService.findOne).toHaveBeenCalledWith({
          code: mockRoom.code,
        });
      }
    });
  });

  describe('join room with password', () => {
    it('should allow participant join', async () => {
      // Arrange
      const saltRounds = 10; // Số lần lặp (salt rounds)
      const hashedPassword = await bcrypt.hash(mockRoom.password, saltRounds);
      const mockRoomWithHashedPassword = {
        ...mockRoom,
        password: hashedPassword,
      };

      mockMeetingService.findOne.mockResolvedValue(mockRoomWithHashedPassword);
      mockMeetingService.update.mockResolvedValue(mockRoom);

      // Act
      const result = await meetingUseCases.joinRoomWithPassword(
        mockRoom,
        mockParticipant,
      );

      // Assert
      expect(result).toBe(mockRoom);
      expect(mockMeetingService.findOne).toHaveBeenCalledWith({
        code: mockRoom.code,
      });
      expect(mockMeetingService.update).toHaveBeenCalledWith(
        mockRoom.id,
        mockRoom,
      );
    });

    it('should throw error - not found room', async () => {
      // Arrange
      mockMeetingService.findOne.mockResolvedValue(null);

      try {
        // Act
        await meetingUseCases.joinRoomWithPassword(mockRoom, mockParticipant);
        // If the above line doesn't throw an error, fail the test
        fail('joinRoomWithPassword did not throw NotFoundException');
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Room Not Found');
        expect(mockMeetingService.findOne).toHaveBeenCalledWith({
          code: mockRoom.code,
        });
      }
    });

    it('should throw error - wrong password', async () => {
      // Arrange
      mockMeetingService.findOne.mockResolvedValue(mockRoom);

      try {
        // Act
        await meetingUseCases.joinRoomWithPassword(mockRoom, mockParticipant);
        // If the above line doesn't throw an error, fail the test
        fail('joinRoomWithPassword did not throw BadRequestException');
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Wrong password!');
        expect(mockMeetingService.findOne).toHaveBeenCalledWith({
          code: mockRoom.code,
        });
      }
    });
  });

  describe('join room for member - without password', () => {
    it('should allow participant join', async () => {
      // Arrange
      mockMeetingService.findOne.mockResolvedValue(mockRoom);
      mockMeetingService.update.mockResolvedValue(mockRoom);
      const mockUserId = 1;

      // Act
      const result = await meetingUseCases.joinRoomForMember(
        mockRoom,
        mockParticipant,
        mockUserId,
      );

      // Assert
      expect(result).toBe(mockRoom);
      expect(mockMeetingService.findOne).toHaveBeenCalledWith({
        code: mockRoom.code,
      });
      expect(mockMeetingService.update).toHaveBeenCalledWith(
        mockRoom.id,
        mockRoom,
      );
    });

    it('should throw error - not found room', async () => {
      // Arrange
      mockMeetingService.findOne.mockResolvedValue(null);
      const mockUserId = 1;

      try {
        // Act
        await meetingUseCases.joinRoomForMember(
          mockRoom,
          mockParticipant,
          mockUserId,
        );
        // If the above line doesn't throw an error, fail the test
        fail('joinRoomForMember did not throw NotFoundException');
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Room Not Found');
        expect(mockMeetingService.findOne).toHaveBeenCalledWith({
          code: mockRoom.code,
        });
      }
    });

    it('should throw error - user not allowed to join directly', async () => {
      // Arrange
      mockMeetingService.findOne.mockResolvedValue(mockRoom);
      mockMeetingService.update.mockResolvedValue(mockRoom);
      const mockUserId = 2;

      // Act
      try {
        // Act
        await meetingUseCases.joinRoomForMember(
          mockRoom,
          mockParticipant,
          mockUserId,
        );
        // If the above line doesn't throw an error, fail the test
        fail('joinRoomForMember did not throw ForbiddenException');
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('User not allow to join directly');
        expect(mockMeetingService.findOne).toHaveBeenCalledWith({
          code: mockRoom.code,
        });
      }
    });
  });

  describe('getParticipantById', () => {
    it('should return participant', async () => {
      // Arrange
      mockParticipantService.findOne.mockResolvedValue(mockParticipant);
      const mockParticipantId = 0;
      const mockSocketId = 'WSid';

      // Act
      const result = await meetingUseCases.getParticipantById(
        mockParticipantId,
        mockSocketId,
      );

      // Assert
      expect(result).toBe(mockParticipant);
      expect(mockParticipantService.findOne).toHaveBeenCalledWith({
        id: mockParticipantId,
      });
    });

    it('should throw error - Not exists participant', async () => {
      // Arrange
      mockParticipantService.findOne.mockResolvedValue(null);
      const mockParticipantId = 0;
      const mockSocketId = '1';

      // Act
      try {
        // Act
        await meetingUseCases.getParticipantById(
          mockParticipantId,
          mockSocketId,
        );
        // If the above line doesn't throw an error, fail the test
        fail('getParticipantById did not throw NotFoundException');
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Not exists participant');
        expect(mockParticipantService.findOne).toHaveBeenCalledWith({
          id: mockParticipantId,
        });
      }
    });

    it('should throw error - Not exists participant', async () => {
      // Arrange
      mockParticipantService.findOne.mockResolvedValue(mockParticipant);
      mockCCURepository.findOne.mockResolvedValue(null);
      const mockParticipantId = 0;
      const mockSocketId = '1';

      try {
        // Act
        await meetingUseCases.getParticipantById(
          mockParticipantId,
          mockSocketId,
        );
        // If the above line doesn't throw an error, fail the test
        fail('getParticipantById did not throw NotFoundException');
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Not exists CCU');
        expect(mockParticipantService.findOne).toHaveBeenCalledWith({
          id: mockParticipantId,
        });
        expect(mockCCURepository.findOne).toHaveBeenCalledWith({
          where: {
            socketId: mockSocketId,
          },
        });
      }
    });

    it('should return participant with new CCU', async () => {
      // Arrange
      const mockCCU: CCU = {
        id: 0,
        socketId: '1',
        podName: '1',
        user: new User(),
        createdAt: undefined,
        participant: new Participant(),
        setEntityName: jest.fn(),
        toJSON: jest.fn(),
        hasId: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
        softRemove: jest.fn(),
        recover: jest.fn(),
        reload: jest.fn(),
      };

      mockParticipantService.findOne.mockResolvedValue(mockParticipant);
      mockCCURepository.findOne.mockResolvedValue(mockCCU);
      mockParticipantService.update.mockResolvedValue({
        ...mockParticipant,
        ccu: mockCCU,
      });
      const mockParticipantId = 0;
      const mockSocketId = '1';

      // Act
      const result = await meetingUseCases.getParticipantById(
        mockParticipantId,
        mockSocketId,
      );

      // Assert
      expect(result).toEqual({
        ...mockParticipant,
        ccu: mockCCU,
      });
      expect(mockParticipantService.findOne).toHaveBeenCalledWith({
        id: mockParticipantId,
      });
      expect(mockParticipantService.update).toHaveBeenCalledWith(
        mockParticipant.id,
        mockParticipant,
      );
    });
  });

  describe('add room member', () => {
    it('should return room with new member added with inviting status', async () => {
      // Arrange
      mockMeetingService.findOne.mockResolvedValue(mockRoom);
      const mockHostId = 1;
      const mockNewUser: User = Object.assign({}, mockUser);

      mockNewUser.id = 12;
      const mockNewMember = new Member();
      mockNewMember.user = mockNewUser;
      const mockNewRoom = {
        ...mockRoom,
        members: [...mockRoom.members, mockNewMember],
      };

      mockUserUseCases.getUserById.mockResolvedValue(mockNewUser);
      mockMeetingService.update.mockResolvedValue(mockNewRoom);

      // Act
      const result = await meetingUseCases.addRoomMember({
        code: mockRoom.code,
        hostId: mockHostId,
        userId: mockNewUser.id,
      });

      // Assert
      expect(result.members.length).toEqual(2);
      expect(mockMeetingService.findOne).toHaveBeenCalledWith({
        code: mockRoom.code,
      });
      expect(mockUserUseCases.getUserById).toHaveBeenCalledWith(mockNewUser.id);
      expect(mockMeetingService.update).toHaveBeenCalledWith(
        mockRoom.id,
        mockNewRoom,
      );
    });
  });
});

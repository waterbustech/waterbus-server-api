import { Test, TestingModule } from '@nestjs/testing';
import { MeetingService } from './meetings.service';
import { Repository } from 'typeorm';
import { Meeting } from '../../core/entities/meeting.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MeetingStatus } from 'src/core/enums/meeting';

describe('MeetingsService', () => {
  let meetingsService: MeetingService;
  let meetingsRepository: Repository<Meeting>;

  const mockMeetingRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingService,
        {
          provide: getRepositoryToken(Meeting),
          useValue: mockMeetingRepository,
        },
      ],
    }).compile();

    meetingsService = module.get<MeetingService>(MeetingService);
    meetingsRepository = module.get<Repository<Meeting>>(
      getRepositoryToken(Meeting),
    );
  });

  describe('create', () => {
    it('should create a meeting and return it', async () => {
      const mockMeeting: Meeting = {
        title: '123',
        password: '123',
        code: 123,
        id: 0,
        members: [],
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
      }; // Mock your meeting object here

      mockMeetingRepository.create.mockReturnValue(mockMeeting);
      mockMeetingRepository.save.mockResolvedValue(mockMeeting);

      const result = await meetingsService.create(mockMeeting);

      expect(result).toBe(mockMeeting);
    });
  });

  describe('findOne', () => {
    it('should find a meeting by conditions and return it', async () => {
      const mockMeeting = {}; // Mock your meeting object here
      const mockConditions = {}; // Mock your conditions here

      mockMeetingRepository.findOne.mockResolvedValue(mockMeeting);

      const result = await meetingsService.findOne(mockConditions);

      expect(result).toBe(mockMeeting);
    });
  });

  describe('update', () => {
    it('should update a meeting and return it', async () => {
      const mockMeetingId = 1; // Mock your meeting ID here
      const mockPartialMeeting = {}; // Mock your partial meeting object here
      const mockUpdatedMeeting = {}; // Mock your updated meeting object here

      mockMeetingRepository.save.mockResolvedValue(mockUpdatedMeeting);

      const result = await meetingsService.update(
        mockMeetingId,
        mockPartialMeeting,
      );

      expect(result).toBe(mockUpdatedMeeting);
    });
  });
});

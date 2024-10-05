import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RecordService } from './record.service';
import { MeetingService } from './meeting.service';
import { UserUseCases } from '../user/user.usecase';
import { Record } from 'src/core/entities/record.entity';
import { RecordTrack } from 'src/core/entities/record-track.entity';
import { RecordStatus } from 'src/core/enums';
import { Participant } from 'src/core/entities/participant.entity';
import { PaginationListQuery } from 'src/core/dtos';

@Injectable()
export class RecordUseCases {
  constructor(
    private recordService: RecordService,
    private meetingService: MeetingService,
    private userUseCases: UserUseCases,
  ) {}

  async getRecordsByCreatedBy({
    userId,
    status = RecordStatus.Finish,
    query,
  }: {
    userId: number;
    status?: RecordStatus;
    query: PaginationListQuery;
  }) {
    return await this.recordService.getRecordsByCreatedBy({
      userId,
      status,
      query,
    });
  }

  async getRecordByStatus({
    meetingId,
    status,
  }: {
    meetingId: number;
    status: RecordStatus;
  }) {
    const record = await this.recordService.findOne({
      meeting: { id: meetingId },
      status: status,
    });

    return record;
  }

  /// Will create Record
  async startRecord({
    userId,
    meetingId,
  }: {
    userId: number;
    meetingId: number;
  }) {
    let user = await this.userUseCases.getUserById(userId);

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    let meeting = await this.meetingService.findOne({ id: meetingId });

    if (!meeting) {
      throw new NotFoundException(`Meeting with id ${meetingId} not found`);
    }

    const isUserJoined = meeting.participants.some(
      (participant) => participant.user.id == userId,
    );

    if (!isUserJoined) {
      throw new BadRequestException('User not exists in the room');
    }

    const newRecord = new Record();
    newRecord.createdBy = user;
    newRecord.meeting = meeting;

    const savedRecord = await this.recordService.create(newRecord);

    return savedRecord;
  }

  /// Will create list Record Track from list of audio & video
  async stopRecord({
    record,
    participants,
    urlToVideos,
  }: {
    record: Record;
    participants: Participant[];
    urlToVideos: string[];
  }) {
    if (!urlToVideos) {
      throw new BadRequestException('videos should be not empty');
    }

    let tracks: RecordTrack[] = [];

    for (let i; i < urlToVideos.length; i++) {
      let track = new RecordTrack();
      track.record = record;
      track.urlToVideo = urlToVideos[i];
      track.participant = participants[i];

      tracks.push(track);
    }

    const savedTracks = await this.recordService.saveTracks(tracks);

    return savedTracks;
  }

  async updateRecord({ record }: { record: Record }) {
    return await this.recordService.update(record.id, record);
  }
}

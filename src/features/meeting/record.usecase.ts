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
import { PaginationListQuery } from 'src/core/dtos';
import { meeting } from 'waterbus-proto';
import { User } from 'src/core';

@Injectable()
export class RecordUseCases {
  constructor(
    private recordService: RecordService,
    private meetingService: MeetingService,
    private userUseCases: UserUseCases,
  ) {}

  async getRecordsByStatus({
    userId,
    status = RecordStatus.Finish,
    query,
  }: {
    userId?: number;
    status?: RecordStatus;
    query: PaginationListQuery;
  }): Promise<Record[]> {
    return await this.recordService.getRecordsByStatus({
      userId,
      status,
      query,
    });
  }

  async getRecordById({
    id,
    status,
  }: {
    id: number;
    status?: RecordStatus;
  }): Promise<Record | null> {
    const record = await this.recordService.findOne({
      id,
      status,
    });

    return record;
  }

  async getRecordByStatus({
    meetingId,
    status,
  }: {
    meetingId?: number;
    status: RecordStatus;
  }): Promise<Record | null> {
    const record = await this.recordService.findOne({
      meeting: { id: meetingId },
      status: status,
    });

    return record;
  }

  async getTracksByRecordId({ id }: { id: number }): Promise<RecordTrack[]> {
    const tracks = await this.recordService.findAllRecordTracks({
      record: { id: id },
    });

    return tracks;
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
    users,
    pTracks,
  }: {
    record: Record;
    users: User[];
    pTracks: meeting.RecordTrackRequest[];
  }) {
    if (!pTracks) return;

    let tracks: RecordTrack[] = [];

    for (let i = 0; i < pTracks.length; i++) {
      let pTrack = pTracks[i];

      let track = new RecordTrack();
      track.record = record;
      track.urlToVideo = pTrack.urlToVideo;
      track.startTime = pTrack.startTime;
      track.endTime = pTrack.endTime;
      track.user = users[i];

      tracks.push(track);
    }

    const savedTracks = await this.recordService.saveTracks(tracks);

    return savedTracks;
  }

  async updateRecord({ record }: { record: Record }) {
    return await this.recordService.update(record.id, record);
  }
}

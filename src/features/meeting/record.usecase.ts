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

@Injectable()
export class RecordUseCases {
  constructor(
    private recordService: RecordService,
    private meetingService: MeetingService,
    private userUseCases: UserUseCases,
  ) {}

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
    recordId,
    urlToVideos,
    urlToAudios,
  }: {
    recordId: number;
    urlToVideos: string[];
    urlToAudios: string[];
  }) {
    if (urlToAudios.length != urlToVideos.length) {
      throw new BadRequestException(
        'length of videos and audios should be same',
      );
    }

    const record = await this.recordService.findOne({ id: recordId });

    if (!record) {
      throw new NotFoundException(`Record with id ${recordId} not found`);
    }

    let tracks: RecordTrack[] = [];

    for (let i; i < urlToVideos.length; i++) {
      let track = new RecordTrack();
      track.record = record;
      track.urlToAudio = urlToAudios[i];
      track.urlToVideo = urlToVideos[i];

      tracks.push(track);
    }

    const savedTracks = await this.recordService.saveTracks(tracks);

    return savedTracks;
  }
}

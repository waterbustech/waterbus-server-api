// cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RecordUseCases } from '../meeting/record.usecase';
import { RecordStatus } from 'src/core/enums';
import { VideoProcessingService } from './video-processing.service';
import { ParticipantTrack } from 'src/core/entities/video-processing';

@Injectable()
export class VideoProcessingCronService {
  constructor(
    private readonly recordUseCases: RecordUseCases,
    private readonly videoProcessingService: VideoProcessingService,
  ) {}

  private readonly logger = new Logger(VideoProcessingCronService.name);

  @Cron('*/1 * * * *') // Executed every 5 mins
  async handleEveryFiveMinutes() {
    try {
      const records = await this.recordUseCases.getRecordsByStatus({
        status: RecordStatus.Processing,
        query: {
          skip: 0,
          limit: 5,
          page: 0,
          perPage: 0,
        },
      });

      for (const record of records) {
        let tracks = await this.recordUseCases.getTracksByRecordId({
          id: record.id,
        });

        tracks = tracks.filter((t) => t && t.startTime && t.endTime);

        if (!tracks) break;

        const sortedTracks = tracks.sort((a, b) => {
          return (
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
        });

        const participantTracks: ParticipantTrack[] = sortedTracks.map(
          (track) => ({
            name: track.user.fullName,
            start_time: track.startTime,
            end_time: track.endTime,
            video_file_path: track.urlToVideo,
          }),
        );

        await this.videoProcessingService.sendToProcessing({
          record_id: record.id.toString(),
          meeting_start_time: sortedTracks[0].startTime,
          participants: participantTracks,
        });
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}

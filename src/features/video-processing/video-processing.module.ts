import { Module } from '@nestjs/common';
import { MeetingModule } from '../meeting/meeting.module';
import { RecordUseCases } from '../meeting/record.usecase';
import { ScheduleModule } from '@nestjs/schedule';
import { VideoProcessingCronService } from './video-processing-cron.service';
import { UserModule } from '../user/user.module';
import { VideoProcessingService } from './video-processing.service';
import { EnvironmentConfigModule } from 'src/core/config/environment/environment.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MeetingModule,
    UserModule,
    EnvironmentConfigModule,
  ],
  providers: [
    RecordUseCases,
    VideoProcessingService,
    VideoProcessingCronService,
  ],
})
export class VideoProcessingModule {}

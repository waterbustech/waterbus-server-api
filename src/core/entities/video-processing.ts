export interface ParticipantTrack {
  name: string;
  start_time: string;
  end_time: string;
  video_file_path: string;
}

export interface VideoProcessingMessage {
  record_id: string;
  meeting_start_time: string;
  participants: ParticipantTrack[];
}

export interface VideoProcessedMessage {
  record_id: string;
  video_url: string;
  duration: number;
  thumbnail_url: string;
}

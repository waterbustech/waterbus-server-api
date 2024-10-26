import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateLatestMessageCreatedAt1727342279462
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const meetings = await queryRunner.query(`
SELECT "meeting"."id" AS "meeting_id", "meeting"."title" AS "meeting_title", "meeting"."password" AS "meeting_password", "meeting"."status" AS "meeting_status", "meeting"."latestMessageCreatedAt" AS "meeting_latestMessageCreatedAt", "meeting"."code" AS "meeting_code", "meeting"."createdAt" AS "meeting_createdAt", "meeting"."updatedAt" AS "meeting_updatedAt", "meeting"."deletedAt" AS "meeting_deletedAt", "latestMessage"."id" AS "latestMessage_id", "latestMessage"."data" AS "latestMessage_data", "latestMessage"."type" AS "latestMessage_type", "latestMessage"."status" AS "latestMessage_status", "latestMessage"."createdAt" AS "latestMessage_createdAt", "latestMessage"."updatedAt" AS "latestMessage_updatedAt", "latestMessage"."deletedAt" AS "latestMessage_deletedAt", "latestMessage"."createdById" AS "latestMessage_createdById", "latestMessage"."meetingId" AS "latestMessage_meetingId" FROM "meetings" "meeting" LEFT JOIN "messages" "latestMessage" ON "latestMessage"."meetingId"="meeting"."id" AND ("latestMessage"."deletedAt" IS NULL) WHERE "meeting"."deletedAt" IS NULL
      `);

    for (const meeting of meetings) {
      const meetingId = meeting.meeting_id;

      let latestMessageCreatedAt = meeting.latestMessage_createdAt
        ? meeting.latestMessage_createdAt
        : meeting.meeting_createdAt;

      await queryRunner.query(
        `UPDATE "meetings" SET "latestMessageCreatedAt" = $1 WHERE "id" = $2`,
        [latestMessageCreatedAt, meetingId],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE "meetings" 
        SET "latestMessageCreatedAt" = NULL 
        WHERE "deletedAt" IS NULL
      `);
  }
}

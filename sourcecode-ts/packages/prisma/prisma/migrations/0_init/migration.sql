-- CreateEnum
CREATE TYPE "AppointmentBookingState" AS ENUM ('Requested', 'Rejected', 'Confirmed', 'Cancelled', 'RescheduleRequested', 'RescheduleConfirmed', 'Done');

-- CreateEnum
CREATE TYPE "DescriptionFormat" AS ENUM ('Plaintext', 'Markdown');

-- CreateEnum
CREATE TYPE "EventIntegrationSourceType" AS ENUM ('CalDAV', 'GoogleCalendar');

-- CreateEnum
CREATE TYPE "EventSourceType" AS ENUM ('AdHoc', 'Integration', 'EventTemplate', 'ProcessItemAttachment', 'RecurringEventInstanceConversion', 'AppointmentBooking');

-- CreateEnum
CREATE TYPE "EventState" AS ENUM ('Active', 'Cancelled', 'Done');

-- CreateEnum
CREATE TYPE "ProcessSourceType" AS ENUM ('AdHoc', 'Integration', 'ProcessTemplate');

-- CreateEnum
CREATE TYPE "ProcessState" AS ENUM ('Active', 'Done', 'Cancelled');

-- CreateEnum
CREATE TYPE "RecurringEventSourceType" AS ENUM ('AdHoc', 'EventTemplate');

-- CreateEnum
CREATE TYPE "RecurringEventState" AS ENUM ('Active', 'Cancelled');

-- CreateEnum
CREATE TYPE "TransparencyScope" AS ENUM ('Public', 'Protected', 'Private');

-- CreateEnum
CREATE TYPE "TrustedViewerEventTagAccess" AS ENUM ('Allow', 'Deny');

-- CreateTable
CREATE TABLE "AppointmentBooking" (
    "Id" SERIAL NOT NULL,
    "CreatedAt" TIMESTAMP(6) NOT NULL,
    "UpdatedAt" TIMESTAMP(6) NOT NULL,
    "Title" VARCHAR(250) NOT NULL,
    "State" "AppointmentBookingState" NOT NULL,
    "RequestorEmail" VARCHAR(255),
    "RequestorPhone" VARCHAR(20),
    "RequestorMessage" VARCHAR(1000),
    "RequestorIANATimezone" VARCHAR(255),
    "SuggestedTime" TIMESTAMP(6) NOT NULL,
    "SuggestedDuration" SMALLINT NOT NULL,

    CONSTRAINT "AppointmentBooking_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "AppointmentBookingCancellationLink" (
    "Id" SERIAL NOT NULL,
    "AppointmentBookingId" INTEGER NOT NULL,
    "ExpirationTime" TIMESTAMP(6) NOT NULL,
    "Active" BOOLEAN NOT NULL DEFAULT true,
    "TokenHash" VARCHAR NOT NULL,

    CONSTRAINT "AppointmentBookingCancellationLink_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "AppointmentBookingRescheduleLink" (
    "Id" SERIAL NOT NULL,
    "AppointmentBookingId" INTEGER NOT NULL,
    "ExpirationTime" TIMESTAMP(6) NOT NULL,
    "Active" BOOLEAN NOT NULL DEFAULT true,
    "TokenHash" VARCHAR NOT NULL,

    CONSTRAINT "AppointmentBookingRescheduleLink_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "AtomicCalendarViewVersion" (
    "Id" SERIAL NOT NULL,
    "UpdatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "AtomicCalendarViewVersion_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Event" (
    "Id" SERIAL NOT NULL,
    "CreatedAt" TIMESTAMP(6) NOT NULL,
    "UpdatedAt" TIMESTAMP(6) NOT NULL,
    "EventSourceReferenceId" INTEGER NOT NULL,
    "EventState" "EventState" NOT NULL,
    "TransparencyScope" "TransparencyScope" NOT NULL,
    "Title" VARCHAR(250) NOT NULL,
    "Description" VARCHAR(5000) NOT NULL,
    "DescriptionFormat" "DescriptionFormat" NOT NULL,
    "ProtectedTitle" VARCHAR(250) NOT NULL,
    "ProtectedDescription" VARCHAR(5000) NOT NULL,
    "ProtectedDescriptionFormat" "DescriptionFormat" NOT NULL,
    "PublicTitle" VARCHAR(250) NOT NULL,
    "PublicDescription" VARCHAR(5000) NOT NULL,
    "PublicDescriptionFormat" "DescriptionFormat" NOT NULL,
    "Notifications" SMALLINT[] DEFAULT ARRAY[]::SMALLINT[],
    "EventTagId" INTEGER,
    "Duration" SMALLINT NOT NULL,
    "ScheduledAtUTC" TIMESTAMP(6) NOT NULL,
    "EndsAtUTC" TIMESTAMP(6) NOT NULL,
    "Metadata" JSONB,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "EventIntegrationSourceReference" (
    "Id" SERIAL NOT NULL,
    "EventIntegrationSourceType" "EventIntegrationSourceType" NOT NULL,
    "CalDAVIntegrationId" INTEGER,
    "GoogleCalendarIntegrationId" INTEGER,

    CONSTRAINT "EventIntegrationSourceReference_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "EventSourceReference" (
    "Id" SERIAL NOT NULL,
    "EventSourceType" "EventSourceType" NOT NULL,
    "EventIntegrationSourceReferenceId" INTEGER,
    "EventTemplateId" INTEGER,
    "ProcessItemAttachmentId" INTEGER,
    "AppointmentBookingId" INTEGER,
    "RecurringEventInstanceConversionId" INTEGER,

    CONSTRAINT "EventSourceReference_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "EventTag" (
    "Id" SERIAL NOT NULL,
    "CreatedAt" TIMESTAMP(6) NOT NULL,
    "UpdatedAt" TIMESTAMP(6) NOT NULL,
    "Alias" VARCHAR(100) NOT NULL,
    "Color" INTEGER NOT NULL,

    CONSTRAINT "EventTag_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "EventTemplate" (
    "Id" SERIAL NOT NULL,
    "CreatedAt" TIMESTAMP(6) NOT NULL,
    "UpdatedAt" TIMESTAMP(6) NOT NULL,
    "Alias" VARCHAR(100) NOT NULL,
    "TransparencyScope" "TransparencyScope" NOT NULL,
    "Title" VARCHAR(250) NOT NULL,
    "Description" VARCHAR(5000) NOT NULL,
    "DescriptionFormat" "DescriptionFormat" NOT NULL,
    "ProtectedTitle" VARCHAR(250),
    "ProtectedDescription" VARCHAR(5000),
    "ProtectedDescriptionFormat" "DescriptionFormat",
    "PublicTitle" VARCHAR(250),
    "PublicDescription" VARCHAR(5000),
    "PublicDescriptionFormat" "DescriptionFormat",
    "Notifications" SMALLINT[] DEFAULT ARRAY[]::SMALLINT[],
    "EventTagId" INTEGER,
    "Duration" SMALLINT NOT NULL,
    "Metadata" JSONB,

    CONSTRAINT "EventTemplate_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "GoogleCalendarIntegration" (
    "Id" SERIAL NOT NULL,
    "CreatedAt" TIMESTAMP(6) NOT NULL,
    "UpdatedAt" TIMESTAMP(6) NOT NULL,
    "IntegrationName" VARCHAR(100) NOT NULL,
    "IntegrationMirrorEventDefaultsId" INTEGER NOT NULL,
    "ApiVersion" VARCHAR(4) NOT NULL,
    "CalendarId" VARCHAR(255) NOT NULL,
    "Scopes" VARCHAR(20)[],
    "ServiceAccKey" JSONB NOT NULL,

    CONSTRAINT "GoogleC_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "HistoricEvent" (
    "Id" SERIAL NOT NULL,
    "MigratedAt" TIMESTAMP(6) NOT NULL,
    "Title" VARCHAR(250) NOT NULL,
    "Description" VARCHAR(5000) NOT NULL,
    "DescriptionFormat" "DescriptionFormat" NOT NULL,
    "ProtectedTitle" VARCHAR(250) NOT NULL,
    "ProtectedDescription" VARCHAR(5000) NOT NULL,
    "ProtectedDescriptionFormat" "DescriptionFormat" NOT NULL,
    "PublicTitle" VARCHAR(250) NOT NULL,
    "PublicDescription" VARCHAR(5000) NOT NULL,
    "PublicDescriptionFormat" "DescriptionFormat" NOT NULL,
    "ScheduledAtUTC" TIMESTAMP(6) NOT NULL,
    "EndedAtUTC" TIMESTAMP(6) NOT NULL,
    "Duration" SMALLINT NOT NULL,
    "EventTagSnapshotAlias" VARCHAR(100),
    "EventTagSnapshotColor" INTEGER,
    "HistoricProcessSnapshotId" INTEGER,

    CONSTRAINT "HistoricEvent_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "HistoricProcessSnapshot" (
    "Id" SERIAL NOT NULL,
    "TakenAt" TIMESTAMP(6) NOT NULL,
    "Title" VARCHAR(250) NOT NULL,
    "Description" VARCHAR(5000) NOT NULL,
    "DescriptionFormat" "DescriptionFormat" NOT NULL,
    "ProtectedTitle" VARCHAR(250) NOT NULL,
    "ProtectedDescription" VARCHAR(5000) NOT NULL,
    "ProtectedDescriptionFormat" "DescriptionFormat" NOT NULL,
    "PublicTitle" VARCHAR(250) NOT NULL,
    "PublicDescription" VARCHAR(5000) NOT NULL,
    "PublicDescriptionFormat" "DescriptionFormat" NOT NULL,
    "OriginalStartsAtUTC" TIMESTAMP(6) NOT NULL,
    "ProcessColor" INTEGER,

    CONSTRAINT "HistoricProcessSnapshot_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "IntegrationMirrorEventDefaults" (
    "Id" SERIAL NOT NULL,
    "TransparencyScope" "TransparencyScope" NOT NULL,
    "ProtectedTitle" VARCHAR(250),
    "ProtectedDescription" VARCHAR(5000),
    "ProtectedDescriptionFormat" "DescriptionFormat",
    "PublicTitle" VARCHAR(250),
    "PublicDescription" VARCHAR(5000),
    "PublicDescriptionFormat" "DescriptionFormat",
    "Notifications" SMALLINT[] DEFAULT ARRAY[]::SMALLINT[],
    "EventTagId" INTEGER,

    CONSTRAINT "IntegrationMirrorEventDefaults_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "MigratePastJobRun" (
    "Id" SERIAL NOT NULL,
    "ExecutedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "MigratePastJobRun_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Process" (
    "Id" SERIAL NOT NULL,
    "CreatedAt" TIMESTAMP(6) NOT NULL,
    "UpdatedAt" TIMESTAMP(6) NOT NULL,
    "ProcessSourceReferenceId" INTEGER NOT NULL,
    "LatestHistoricProcessSnapshotId" INTEGER,
    "ProcessState" "ProcessState" NOT NULL,
    "TransparencyScope" "TransparencyScope" NOT NULL,
    "Title" VARCHAR(250) NOT NULL,
    "Description" VARCHAR(5000) NOT NULL,
    "DescriptionFormat" "DescriptionFormat" NOT NULL,
    "ProtectedTitle" VARCHAR(250) NOT NULL,
    "ProtectedDescription" VARCHAR(5000) NOT NULL,
    "ProtectedDescriptionFormat" "DescriptionFormat" NOT NULL,
    "PublicTitle" VARCHAR(250) NOT NULL,
    "PublicDescription" VARCHAR(5000) NOT NULL,
    "PublicDescriptionFormat" "DescriptionFormat" NOT NULL,
    "Notifications" SMALLINT[] DEFAULT ARRAY[]::SMALLINT[],
    "EventTagId" INTEGER,
    "ScheduleBaselineUTC" TIMESTAMP(6) NOT NULL,
    "StartsAtUTC" TIMESTAMP(6) NOT NULL,
    "ProcessColor" INTEGER,

    CONSTRAINT "Process_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ProcessItemAttachment" (
    "Id" SERIAL NOT NULL,
    "CreatedAt" TIMESTAMP(6) NOT NULL,
    "UpdatedAt" TIMESTAMP(6) NOT NULL,
    "ProcessId" INTEGER NOT NULL,
    "IsActive" BOOLEAN NOT NULL,
    "Index" SMALLINT NOT NULL,
    "ItemOffset" JSONB NOT NULL,
    "CalculatedItemOffsetInMinutes" INTEGER NOT NULL,

    CONSTRAINT "ProcessItemAttachment_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ProcessSourceReference" (
    "Id" SERIAL NOT NULL,
    "ProcessSourceType" "ProcessSourceType" NOT NULL,
    "ProcessTemplateId" INTEGER,

    CONSTRAINT "ProcessSourceReference_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ProcessTemplate" (
    "Id" SERIAL NOT NULL,
    "CreatedAt" TIMESTAMP(6) NOT NULL,
    "UpdatedAt" TIMESTAMP(6) NOT NULL,
    "Alias" VARCHAR(100) NOT NULL,
    "TransparencyScope" "TransparencyScope" NOT NULL,
    "Title" VARCHAR(250) NOT NULL,
    "Description" VARCHAR(5000) NOT NULL,
    "DescriptionFormat" "DescriptionFormat" NOT NULL,
    "ProtectedTitle" VARCHAR(250),
    "ProtectedDescription" VARCHAR(5000),
    "ProtectedDescriptionFormat" "DescriptionFormat",
    "PublicTitle" VARCHAR(250),
    "PublicDescription" VARCHAR(5000),
    "PublicDescriptionFormat" "DescriptionFormat",
    "Notifications" SMALLINT[] DEFAULT ARRAY[]::SMALLINT[],
    "EventTagId" INTEGER,
    "ProcessColor" INTEGER,

    CONSTRAINT "ProcessTemplate_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ProcessTemplateItem" (
    "Id" SERIAL NOT NULL,
    "ProcessTemplateId" INTEGER NOT NULL,
    "Index" SMALLINT NOT NULL,
    "ItemOffset" JSONB NOT NULL,
    "EventTemplateId" INTEGER NOT NULL,

    CONSTRAINT "ProcessTemplateItem_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "RecurringEvent" (
    "Id" SERIAL NOT NULL,
    "CreatedAt" TIMESTAMP(6) NOT NULL,
    "UpdatedAt" TIMESTAMP(6) NOT NULL,
    "RecurringEventSourceReferenceId" INTEGER NOT NULL,
    "RecurringEventState" "RecurringEventState" NOT NULL,
    "TransparencyScope" "TransparencyScope" NOT NULL,
    "Title" VARCHAR(250) NOT NULL,
    "Description" VARCHAR(5000) NOT NULL,
    "DescriptionFormat" "DescriptionFormat" NOT NULL,
    "ProtectedTitle" VARCHAR(250) NOT NULL,
    "ProtectedDescription" VARCHAR(5000) NOT NULL,
    "ProtectedDescriptionFormat" "DescriptionFormat" NOT NULL,
    "PublicTitle" VARCHAR(250) NOT NULL,
    "PublicDescription" VARCHAR(5000) NOT NULL,
    "PublicDescriptionFormat" "DescriptionFormat" NOT NULL,
    "Notifications" SMALLINT[] DEFAULT ARRAY[]::SMALLINT[],
    "EventTagId" INTEGER,
    "Duration" SMALLINT NOT NULL,
    "Recurrence" JSONB NOT NULL,
    "BaselineUTCSchedule" TIMESTAMP(6) NOT NULL,
    "Metadata" JSONB,

    CONSTRAINT "RecurringEvent_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "RecurringEventInstance" (
    "Id" SERIAL NOT NULL,
    "RecurringEventId" INTEGER NOT NULL,
    "AtomicCalendarViewVersionId" INTEGER NOT NULL,
    "RecurringEventInstanceConversionId" INTEGER,
    "OffsetFromBaselineDays" SMALLINT NOT NULL,
    "ScheduledAtUTC" TIMESTAMP(6) NOT NULL,
    "EndsAtUTC" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "RecurringEventInstance_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "RecurringEventInstanceConversion" (
    "Id" SERIAL NOT NULL,
    "ConvertedAt" TIMESTAMP(6) NOT NULL,
    "InheritedRecurringEventSourceType" "RecurringEventSourceType" NOT NULL,
    "InheritedEventTemplateId" INTEGER,

    CONSTRAINT "RecurringEventInstanceConversion_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "RecurringEventInstanceSet" (
    "Id" SERIAL NOT NULL,
    "AtomicCalendarViewVersionId" INTEGER NOT NULL,
    "IntervalFromUTC" TIMESTAMP(6) NOT NULL,
    "IntervalToUTC" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "RecurringEventInstanceSet_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "RecurringEventInstanceSetMembership" (
    "Id" SERIAL NOT NULL,
    "RecurringEventInstanceSetId" INTEGER NOT NULL,
    "RecurringEventInstanceId" INTEGER NOT NULL,

    CONSTRAINT "RecurringEventInstanceSetMembership_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "RecurringEventSourceReference" (
    "Id" SERIAL NOT NULL,
    "RecurringEventSourceType" "RecurringEventSourceType" NOT NULL,
    "EventTemplateId" INTEGER,

    CONSTRAINT "RecurringEventSourceReference_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "TrustedViewer" (
    "Id" SERIAL NOT NULL,
    "Alias" VARCHAR(100) NOT NULL,
    "ViewerUuid" UUID NOT NULL,
    "Active" BOOLEAN NOT NULL DEFAULT true,
    "PasswordHash" VARCHAR NOT NULL,
    "RefreshTokenRandomHash" VARCHAR,
    "DefaultEventTagAccess" "TrustedViewerEventTagAccess" NOT NULL,
    "TrustedViewerCalendarPermissionsId" INTEGER NOT NULL,
    "GrantExpiresAt" TIMESTAMP(6),
    "WebAppSettings" JSONB,

    CONSTRAINT "TrustedViewerToken_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "TrustedViewerCalendarPermissions" (
    "Id" SERIAL NOT NULL,
    "CanSeeTags" BOOLEAN NOT NULL,
    "CanSeeProcessAssociations" BOOLEAN NOT NULL,
    "CanViewPast" BOOLEAN NOT NULL,
    "CanSwitchToPublicView" BOOLEAN NOT NULL,

    CONSTRAINT "TrustedViewerCalendarPermissions_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "TrustedViewerEventTagPermission" (
    "Id" SERIAL NOT NULL,
    "TrustedViewerId" INTEGER NOT NULL,
    "EventTagId" INTEGER NOT NULL,
    "EventTagAccess" "TrustedViewerEventTagAccess" NOT NULL,

    CONSTRAINT "TrustedViewerEventTagPermission_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_EventSourceReferenceId_key" ON "Event"("EventSourceReferenceId");

-- CreateIndex
CREATE UNIQUE INDEX "EventTag_Alias_key" ON "EventTag"("Alias");

-- CreateIndex
CREATE UNIQUE INDEX "EventTag_Color_key" ON "EventTag"("Color");

-- CreateIndex
CREATE UNIQUE INDEX "EventTemplate_Alias_key" ON "EventTemplate"("Alias");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessItemAttachment_ProcessId_ItemOffset_key" ON "ProcessItemAttachment"("ProcessId", "ItemOffset");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessTemplate_Alias_key" ON "ProcessTemplate"("Alias");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessTemplateItem_ProcessTemplateId_Index_key" ON "ProcessTemplateItem"("ProcessTemplateId", "Index");

-- CreateIndex
CREATE UNIQUE INDEX "RecurringEvent_RecurringEventSourceReferenceId_key" ON "RecurringEvent"("RecurringEventSourceReferenceId");

-- CreateIndex
CREATE UNIQUE INDEX "RecurringEventInstance_RecurringEventId_AtomicCalendarViewV_key" ON "RecurringEventInstance"("RecurringEventId", "AtomicCalendarViewVersionId", "OffsetFromBaselineDays");

-- CreateIndex
CREATE UNIQUE INDEX "RecurringEventInstanceSet_AtomicCalendarViewVersionId_Inter_key" ON "RecurringEventInstanceSet"("AtomicCalendarViewVersionId", "IntervalFromUTC", "IntervalToUTC");

-- CreateIndex
CREATE UNIQUE INDEX "RecurringEventInstanceSetMemb_RecurringEventInstanceSetId_R_key" ON "RecurringEventInstanceSetMembership"("RecurringEventInstanceSetId", "RecurringEventInstanceId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustedViewerToken_Alias_key" ON "TrustedViewer"("Alias");

-- CreateIndex
CREATE UNIQUE INDEX "TrustedViewer_ViewerUuid_key" ON "TrustedViewer"("ViewerUuid");

-- CreateIndex
CREATE UNIQUE INDEX "TrustedViewerEventTagPermission_TrustedViewerId_EventTagId_key" ON "TrustedViewerEventTagPermission"("TrustedViewerId", "EventTagId");

-- AddForeignKey
ALTER TABLE "AppointmentBookingCancellationLink" ADD CONSTRAINT "AppointmentBookingCancellationLink_AppointmentBookingId_fkey" FOREIGN KEY ("AppointmentBookingId") REFERENCES "AppointmentBooking"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AppointmentBookingRescheduleLink" ADD CONSTRAINT "AppointmentBookingRescheduleLink_AppointmentBookingId_fkey" FOREIGN KEY ("AppointmentBookingId") REFERENCES "AppointmentBooking"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_EventSourceReferenceId_fkey" FOREIGN KEY ("EventSourceReferenceId") REFERENCES "EventSourceReference"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_EventTagId_fkey" FOREIGN KEY ("EventTagId") REFERENCES "EventTag"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "EventIntegrationSourceReference" ADD CONSTRAINT "EventIntegrationSourceReferenc_GoogleCalendarIntegrationId_fkey" FOREIGN KEY ("GoogleCalendarIntegrationId") REFERENCES "GoogleCalendarIntegration"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "EventSourceReference" ADD CONSTRAINT "EventSourceReference_AppointmentBookingId_fkey" FOREIGN KEY ("AppointmentBookingId") REFERENCES "AppointmentBooking"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "EventSourceReference" ADD CONSTRAINT "EventSourceReference_EventIntegrationSourceReferenceId_fkey" FOREIGN KEY ("EventIntegrationSourceReferenceId") REFERENCES "EventIntegrationSourceReference"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "EventSourceReference" ADD CONSTRAINT "EventSourceReference_EventTemplateId_fkey" FOREIGN KEY ("EventTemplateId") REFERENCES "EventTemplate"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "EventSourceReference" ADD CONSTRAINT "EventSourceReference_ProcessItemAttachmentId_fkey" FOREIGN KEY ("ProcessItemAttachmentId") REFERENCES "ProcessItemAttachment"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "EventSourceReference" ADD CONSTRAINT "EventSourceReference_RecurringEventInstanceConversionId_fkey" FOREIGN KEY ("RecurringEventInstanceConversionId") REFERENCES "RecurringEventInstanceConversion"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "EventTemplate" ADD CONSTRAINT "EventTemplate_EventTagId_fkey" FOREIGN KEY ("EventTagId") REFERENCES "EventTag"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GoogleCalendarIntegration" ADD CONSTRAINT "GoogleCalendarIntegration_IntegrationMirrorEventDefaultsId_fkey" FOREIGN KEY ("IntegrationMirrorEventDefaultsId") REFERENCES "IntegrationMirrorEventDefaults"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "HistoricEvent" ADD CONSTRAINT "HistoricEvent_HistoricProcessSnapshotId_fkey" FOREIGN KEY ("HistoricProcessSnapshotId") REFERENCES "HistoricProcessSnapshot"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "IntegrationMirrorEventDefaults" ADD CONSTRAINT "IntegrationMirrorEventDefaults_EventTagId_fkey" FOREIGN KEY ("EventTagId") REFERENCES "EventTag"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Process" ADD CONSTRAINT "Process_EventTagId_fkey" FOREIGN KEY ("EventTagId") REFERENCES "EventTag"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Process" ADD CONSTRAINT "Process_LatestHistoricProcessSnapshotId_fkey" FOREIGN KEY ("LatestHistoricProcessSnapshotId") REFERENCES "HistoricProcessSnapshot"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Process" ADD CONSTRAINT "Process_ProcessSourceReferenceId_fkey" FOREIGN KEY ("ProcessSourceReferenceId") REFERENCES "ProcessSourceReference"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProcessItemAttachment" ADD CONSTRAINT "ProcessItemAttachment_ProcessId_fkey" FOREIGN KEY ("ProcessId") REFERENCES "Process"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProcessSourceReference" ADD CONSTRAINT "ProcessSourceReference_ProcessTemplateId_fkey" FOREIGN KEY ("ProcessTemplateId") REFERENCES "ProcessTemplate"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProcessTemplate" ADD CONSTRAINT "ProcessTemplate_EventTagId_fkey" FOREIGN KEY ("EventTagId") REFERENCES "EventTag"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProcessTemplateItem" ADD CONSTRAINT "ProcessTemplateEntry_ProcessTemplateId_fkey" FOREIGN KEY ("ProcessTemplateId") REFERENCES "ProcessTemplate"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProcessTemplateItem" ADD CONSTRAINT "ProcessTemplateItem_EventTemplateId_fkey" FOREIGN KEY ("EventTemplateId") REFERENCES "EventTemplate"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RecurringEvent" ADD CONSTRAINT "RecurringEvent_EventTagId_fkey" FOREIGN KEY ("EventTagId") REFERENCES "EventTag"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RecurringEvent" ADD CONSTRAINT "RecurringEvent_RecurringEventSourceReferenceId_fkey" FOREIGN KEY ("RecurringEventSourceReferenceId") REFERENCES "RecurringEventSourceReference"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RecurringEventInstance" ADD CONSTRAINT "RecurringEventInstance_AtomicCalendarViewVersionId_fkey" FOREIGN KEY ("AtomicCalendarViewVersionId") REFERENCES "AtomicCalendarViewVersion"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RecurringEventInstance" ADD CONSTRAINT "RecurringEventInstance_RecurringEventId_fkey" FOREIGN KEY ("RecurringEventId") REFERENCES "RecurringEvent"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RecurringEventInstance" ADD CONSTRAINT "RecurringEventInstance_RecurringEventInstanceConversionId_fkey" FOREIGN KEY ("RecurringEventInstanceConversionId") REFERENCES "RecurringEventInstanceConversion"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RecurringEventInstanceSet" ADD CONSTRAINT "RecurringEventInstanceSet_AtomicCalendarViewVersionId_fkey" FOREIGN KEY ("AtomicCalendarViewVersionId") REFERENCES "AtomicCalendarViewVersion"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RecurringEventInstanceSetMembership" ADD CONSTRAINT "RecurringEventInstanceSetMembe_RecurringEventInstanceSetId_fkey" FOREIGN KEY ("RecurringEventInstanceSetId") REFERENCES "RecurringEventInstanceSet"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RecurringEventInstanceSetMembership" ADD CONSTRAINT "RecurringEventInstanceSetMembersh_RecurringEventInstanceId_fkey" FOREIGN KEY ("RecurringEventInstanceId") REFERENCES "RecurringEventInstance"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RecurringEventSourceReference" ADD CONSTRAINT "RecurringEventSourceReference_EventTemplateId_fkey" FOREIGN KEY ("EventTemplateId") REFERENCES "EventTemplate"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TrustedViewer" ADD CONSTRAINT "TrustedViewer_TrustedViewerCalendarPermissionsId_fkey" FOREIGN KEY ("TrustedViewerCalendarPermissionsId") REFERENCES "TrustedViewerCalendarPermissions"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TrustedViewerEventTagPermission" ADD CONSTRAINT "TrustedViewerEventTagPermission_EventTagId_fkey" FOREIGN KEY ("EventTagId") REFERENCES "EventTag"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TrustedViewerEventTagPermission" ADD CONSTRAINT "TrustedViewerEventTagPermission_TrustedViewerId_fkey" FOREIGN KEY ("TrustedViewerId") REFERENCES "TrustedViewer"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;


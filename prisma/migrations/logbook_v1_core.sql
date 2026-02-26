BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[LogbookEntry] DROP CONSTRAINT [LogbookEntry_userId_fkey];

-- AlterTable
ALTER TABLE [dbo].[LogbookEntry] ADD [actualInstrumentTime] FLOAT(53) NOT NULL CONSTRAINT [LogbookEntry_actualInstrumentTime_df] DEFAULT 0,
[aircraftCategoryClass] NVARCHAR(100),
[aircraftId] NVARCHAR(36),
[aircraftModel] NVARCHAR(100),
[approaches] INT NOT NULL CONSTRAINT [LogbookEntry_approaches_df] DEFAULT 0,
[arrivalTime] DATETIME2,
[authority] NVARCHAR(10) NOT NULL CONSTRAINT [LogbookEntry_authority_df] DEFAULT 'FAA',
[blockTime] FLOAT(53) CONSTRAINT [LogbookEntry_blockTime_df] DEFAULT 0,
[crewRole] NVARCHAR(50),
[departureTime] DATETIME2,
[dmeArcs] INT NOT NULL CONSTRAINT [LogbookEntry_dmeArcs_df] DEFAULT 0,
[easaType] NVARCHAR(50),
[faaType] NVARCHAR(50),
[hobbsEnd] FLOAT(53),
[hobbsStart] FLOAT(53),
[holds] INT NOT NULL CONSTRAINT [LogbookEntry_holds_df] DEFAULT 0,
[ifrTime] FLOAT(53) NOT NULL CONSTRAINT [LogbookEntry_ifrTime_df] DEFAULT 0,
[instructionGiven] FLOAT(53) NOT NULL CONSTRAINT [LogbookEntry_instructionGiven_df] DEFAULT 0,
[instructorId] NVARCHAR(36),
[intercepts] INT NOT NULL CONSTRAINT [LogbookEntry_intercepts_df] DEFAULT 0,
[isCrossCountry] BIT NOT NULL CONSTRAINT [LogbookEntry_isCrossCountry_df] DEFAULT 0,
[isDual] BIT NOT NULL CONSTRAINT [LogbookEntry_isDual_df] DEFAULT 0,
[isIFR] BIT NOT NULL CONSTRAINT [LogbookEntry_isIFR_df] DEFAULT 0,
[isIMC] BIT NOT NULL CONSTRAINT [LogbookEntry_isIMC_df] DEFAULT 0,
[isInstructionGiven] BIT NOT NULL CONSTRAINT [LogbookEntry_isInstructionGiven_df] DEFAULT 0,
[isNight] BIT NOT NULL CONSTRAINT [LogbookEntry_isNight_df] DEFAULT 0,
[isPending] BIT NOT NULL CONSTRAINT [LogbookEntry_isPending_df] DEFAULT 0,
[isSolo] BIT NOT NULL CONSTRAINT [LogbookEntry_isSolo_df] DEFAULT 0,
[isVFR] BIT NOT NULL CONSTRAINT [LogbookEntry_isVFR_df] DEFAULT 1,
[isVMC] BIT NOT NULL CONSTRAINT [LogbookEntry_isVMC_df] DEFAULT 1,
[landingsFullStop] INT CONSTRAINT [LogbookEntry_landingsFullStop_df] DEFAULT 0,
[picTime] FLOAT(53) NOT NULL CONSTRAINT [LogbookEntry_picTime_df] DEFAULT 0,
[routeDistanceNm] FLOAT(53) CONSTRAINT [LogbookEntry_routeDistanceNm_df] DEFAULT 0,
[routeId] NVARCHAR(36),
[routeVia] NVARCHAR(max),
[sicTime] FLOAT(53) NOT NULL CONSTRAINT [LogbookEntry_sicTime_df] DEFAULT 0,
[simulatedInstrumentTime] FLOAT(53) NOT NULL CONSTRAINT [LogbookEntry_simulatedInstrumentTime_df] DEFAULT 0,
[studentId] NVARCHAR(36),
[tachEnd] FLOAT(53),
[tachStart] FLOAT(53),
[vfrTime] FLOAT(53) NOT NULL CONSTRAINT [LogbookEntry_vfrTime_df] DEFAULT 0;

-- CreateTable
CREATE TABLE [dbo].[AircraftModel] (
    [id] NVARCHAR(36) NOT NULL,
    [manufacturer] NVARCHAR(100),
    [model] NVARCHAR(100) NOT NULL,
    [categoryClass] NVARCHAR(100),
    [engineType] NVARCHAR(50),
    [isComplex] BIT NOT NULL CONSTRAINT [AircraftModel_isComplex_df] DEFAULT 0,
    [isHighPerformance] BIT NOT NULL CONSTRAINT [AircraftModel_isHighPerformance_df] DEFAULT 0,
    [isTailwheel] BIT NOT NULL CONSTRAINT [AircraftModel_isTailwheel_df] DEFAULT 0,
    [isMultiEngine] BIT NOT NULL CONSTRAINT [AircraftModel_isMultiEngine_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AircraftModel_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [AircraftModel_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[AircraftProfile] (
    [id] NVARCHAR(36) NOT NULL,
    [userId] NVARCHAR(36) NOT NULL,
    [nNumber] NVARCHAR(10) NOT NULL,
    [nickname] NVARCHAR(100),
    [modelId] NVARCHAR(36),
    [categoryClass] NVARCHAR(100),
    [engineType] NVARCHAR(50),
    [notes] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AircraftProfile_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [AircraftProfile_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[InstructorProfile] (
    [id] NVARCHAR(36) NOT NULL,
    [userId] NVARCHAR(36) NOT NULL,
    [certificateNumber] NVARCHAR(100) NOT NULL,
    [certificateType] NVARCHAR(100),
    [certificateIssuer] NVARCHAR(50),
    [certificateExpires] DATETIME2,
    [verificationStatus] NVARCHAR(20) NOT NULL CONSTRAINT [InstructorProfile_verificationStatus_df] DEFAULT 'pending',
    [verificationNotes] NVARCHAR(max),
    [verifiedAt] DATETIME2,
    [verifiedBy] NVARCHAR(36),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [InstructorProfile_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [InstructorProfile_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [InstructorProfile_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[InstructorCertificate] (
    [id] NVARCHAR(36) NOT NULL,
    [instructorId] NVARCHAR(36) NOT NULL,
    [fileUrl] NVARCHAR(500) NOT NULL,
    [fileName] NVARCHAR(255) NOT NULL,
    [mimeType] NVARCHAR(100),
    [uploadedAt] DATETIME2 NOT NULL CONSTRAINT [InstructorCertificate_uploadedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [InstructorCertificate_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Signature] (
    [id] NVARCHAR(36) NOT NULL,
    [userId] NVARCHAR(36) NOT NULL,
    [type] NVARCHAR(20) NOT NULL CONSTRAINT [Signature_type_df] DEFAULT 'drawn',
    [svgData] NVARCHAR(max),
    [typedName] NVARCHAR(255),
    [certNumber] NVARCHAR(100),
    [ipAddress] NVARCHAR(50),
    [userAgent] NVARCHAR(255),
    [hash] NVARCHAR(64) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Signature_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Signature_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EndorsementTemplate] (
    [id] NVARCHAR(36) NOT NULL,
    [authority] NVARCHAR(10) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [code] NVARCHAR(100) NOT NULL,
    [text] NVARCHAR(max) NOT NULL,
    [category] NVARCHAR(100),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [EndorsementTemplate_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [EndorsementTemplate_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Endorsement] (
    [id] NVARCHAR(36) NOT NULL,
    [templateId] NVARCHAR(36) NOT NULL,
    [studentId] NVARCHAR(36) NOT NULL,
    [instructorId] NVARCHAR(36) NOT NULL,
    [signatureId] NVARCHAR(36) NOT NULL,
    [logbookEntryId] NVARCHAR(36),
    [signedAt] DATETIME2 NOT NULL CONSTRAINT [Endorsement_signedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [notes] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Endorsement_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Endorsement_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EndorsementRequest] (
    [id] NVARCHAR(36) NOT NULL,
    [studentId] NVARCHAR(36) NOT NULL,
    [instructorId] NVARCHAR(36) NOT NULL,
    [templateId] NVARCHAR(36),
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [EndorsementRequest_status_df] DEFAULT 'pending',
    [message] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [EndorsementRequest_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [EndorsementRequest_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[LogbookAttachment] (
    [id] NVARCHAR(36) NOT NULL,
    [logbookEntryId] NVARCHAR(36) NOT NULL,
    [fileUrl] NVARCHAR(500) NOT NULL,
    [fileName] NVARCHAR(255) NOT NULL,
    [mimeType] NVARCHAR(100),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [LogbookAttachment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [LogbookAttachment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[LogbookStartingTotal] (
    [id] NVARCHAR(36) NOT NULL,
    [userId] NVARCHAR(36) NOT NULL,
    [totalTime] FLOAT(53) NOT NULL CONSTRAINT [LogbookStartingTotal_totalTime_df] DEFAULT 0,
    [picTime] FLOAT(53) NOT NULL CONSTRAINT [LogbookStartingTotal_picTime_df] DEFAULT 0,
    [sicTime] FLOAT(53) NOT NULL CONSTRAINT [LogbookStartingTotal_sicTime_df] DEFAULT 0,
    [nightTime] FLOAT(53) NOT NULL CONSTRAINT [LogbookStartingTotal_nightTime_df] DEFAULT 0,
    [instrumentTime] FLOAT(53) NOT NULL CONSTRAINT [LogbookStartingTotal_instrumentTime_df] DEFAULT 0,
    [crossCountryTime] FLOAT(53) NOT NULL CONSTRAINT [LogbookStartingTotal_crossCountryTime_df] DEFAULT 0,
    [landingsDay] INT NOT NULL CONSTRAINT [LogbookStartingTotal_landingsDay_df] DEFAULT 0,
    [landingsNight] INT NOT NULL CONSTRAINT [LogbookStartingTotal_landingsNight_df] DEFAULT 0,
    [asOfDate] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [LogbookStartingTotal_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [LogbookStartingTotal_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [LogbookStartingTotal_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[CurrencyRule] (
    [id] NVARCHAR(36) NOT NULL,
    [authority] NVARCHAR(10) NOT NULL,
    [code] NVARCHAR(50) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [ruleJson] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [CurrencyRule_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [CurrencyRule_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[CurrencyStatus] (
    [id] NVARCHAR(36) NOT NULL,
    [userId] NVARCHAR(36) NOT NULL,
    [ruleId] NVARCHAR(36) NOT NULL,
    [status] NVARCHAR(20) NOT NULL,
    [lastSatisfiedAt] DATETIME2,
    [nextDueAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [CurrencyStatus_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [CurrencyStatus_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [CurrencyStatus_userId_ruleId_key] UNIQUE NONCLUSTERED ([userId],[ruleId])
);

-- CreateTable
CREATE TABLE [dbo].[CurrencyEvent] (
    [id] NVARCHAR(36) NOT NULL,
    [userId] NVARCHAR(36) NOT NULL,
    [ruleCode] NVARCHAR(50) NOT NULL,
    [eventDate] DATETIME2 NOT NULL,
    [details] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [CurrencyEvent_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [CurrencyEvent_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[LogbookImport] (
    [id] NVARCHAR(36) NOT NULL,
    [userId] NVARCHAR(36) NOT NULL,
    [source] NVARCHAR(50) NOT NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [LogbookImport_status_df] DEFAULT 'pending',
    [fileUrl] NVARCHAR(500),
    [summaryJson] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [LogbookImport_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [LogbookImport_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[FlightRoute] (
    [id] NVARCHAR(36) NOT NULL,
    [userId] NVARCHAR(36) NOT NULL,
    [name] NVARCHAR(200),
    [routeIcaos] NVARCHAR(max) NOT NULL,
    [totalDistanceNm] FLOAT(53) CONSTRAINT [FlightRoute_totalDistanceNm_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [FlightRoute_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [FlightRoute_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[AirportVisit] (
    [id] NVARCHAR(36) NOT NULL,
    [userId] NVARCHAR(36) NOT NULL,
    [icao] NVARCHAR(10) NOT NULL,
    [firstVisited] DATETIME2 NOT NULL,
    [lastVisited] DATETIME2 NOT NULL,
    [visits] INT NOT NULL CONSTRAINT [AirportVisit_visits_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AirportVisit_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [AirportVisit_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AirportVisit_userId_icao_key] UNIQUE NONCLUSTERED ([userId],[icao])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AircraftModel_manufacturer_idx] ON [dbo].[AircraftModel]([manufacturer]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AircraftModel_model_idx] ON [dbo].[AircraftModel]([model]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AircraftProfile_userId_idx] ON [dbo].[AircraftProfile]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [InstructorCertificate_instructorId_idx] ON [dbo].[InstructorCertificate]([instructorId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Signature_userId_idx] ON [dbo].[Signature]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [EndorsementTemplate_authority_idx] ON [dbo].[EndorsementTemplate]([authority]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [EndorsementTemplate_category_idx] ON [dbo].[EndorsementTemplate]([category]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Endorsement_studentId_idx] ON [dbo].[Endorsement]([studentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Endorsement_instructorId_idx] ON [dbo].[Endorsement]([instructorId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Endorsement_templateId_idx] ON [dbo].[Endorsement]([templateId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [EndorsementRequest_studentId_idx] ON [dbo].[EndorsementRequest]([studentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [EndorsementRequest_instructorId_idx] ON [dbo].[EndorsementRequest]([instructorId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [LogbookAttachment_logbookEntryId_idx] ON [dbo].[LogbookAttachment]([logbookEntryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CurrencyRule_authority_idx] ON [dbo].[CurrencyRule]([authority]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CurrencyStatus_userId_idx] ON [dbo].[CurrencyStatus]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CurrencyEvent_userId_idx] ON [dbo].[CurrencyEvent]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [LogbookImport_userId_idx] ON [dbo].[LogbookImport]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [FlightRoute_userId_idx] ON [dbo].[FlightRoute]([userId]);

-- AddForeignKey
ALTER TABLE [dbo].[LogbookEntry] ADD CONSTRAINT [LogbookEntry_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[LogbookEntry] ADD CONSTRAINT [LogbookEntry_instructorId_fkey] FOREIGN KEY ([instructorId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[LogbookEntry] ADD CONSTRAINT [LogbookEntry_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[LogbookEntry] ADD CONSTRAINT [LogbookEntry_aircraftId_fkey] FOREIGN KEY ([aircraftId]) REFERENCES [dbo].[AircraftProfile]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[LogbookEntry] ADD CONSTRAINT [LogbookEntry_routeId_fkey] FOREIGN KEY ([routeId]) REFERENCES [dbo].[FlightRoute]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AircraftProfile] ADD CONSTRAINT [AircraftProfile_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AircraftProfile] ADD CONSTRAINT [AircraftProfile_modelId_fkey] FOREIGN KEY ([modelId]) REFERENCES [dbo].[AircraftModel]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[InstructorProfile] ADD CONSTRAINT [InstructorProfile_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[InstructorCertificate] ADD CONSTRAINT [InstructorCertificate_instructorId_fkey] FOREIGN KEY ([instructorId]) REFERENCES [dbo].[InstructorProfile]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Signature] ADD CONSTRAINT [Signature_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Endorsement] ADD CONSTRAINT [Endorsement_templateId_fkey] FOREIGN KEY ([templateId]) REFERENCES [dbo].[EndorsementTemplate]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Endorsement] ADD CONSTRAINT [Endorsement_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Endorsement] ADD CONSTRAINT [Endorsement_instructorId_fkey] FOREIGN KEY ([instructorId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Endorsement] ADD CONSTRAINT [Endorsement_signatureId_fkey] FOREIGN KEY ([signatureId]) REFERENCES [dbo].[Signature]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Endorsement] ADD CONSTRAINT [Endorsement_logbookEntryId_fkey] FOREIGN KEY ([logbookEntryId]) REFERENCES [dbo].[LogbookEntry]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EndorsementRequest] ADD CONSTRAINT [EndorsementRequest_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EndorsementRequest] ADD CONSTRAINT [EndorsementRequest_instructorId_fkey] FOREIGN KEY ([instructorId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EndorsementRequest] ADD CONSTRAINT [EndorsementRequest_templateId_fkey] FOREIGN KEY ([templateId]) REFERENCES [dbo].[EndorsementTemplate]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[LogbookAttachment] ADD CONSTRAINT [LogbookAttachment_logbookEntryId_fkey] FOREIGN KEY ([logbookEntryId]) REFERENCES [dbo].[LogbookEntry]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[LogbookStartingTotal] ADD CONSTRAINT [LogbookStartingTotal_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CurrencyStatus] ADD CONSTRAINT [CurrencyStatus_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CurrencyStatus] ADD CONSTRAINT [CurrencyStatus_ruleId_fkey] FOREIGN KEY ([ruleId]) REFERENCES [dbo].[CurrencyRule]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CurrencyEvent] ADD CONSTRAINT [CurrencyEvent_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[LogbookImport] ADD CONSTRAINT [LogbookImport_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[FlightRoute] ADD CONSTRAINT [FlightRoute_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AirportVisit] ADD CONSTRAINT [AirportVisit_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

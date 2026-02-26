BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[LogbookPreferences] (
    [id] NVARCHAR(36) NOT NULL,
    [userId] NVARCHAR(36) NOT NULL,
    [timeDisplayFormat] NVARCHAR(50) NOT NULL CONSTRAINT [LogbookPreferences_timeDisplayFormat_df] DEFAULT 'decimal-1-2',
    [sumTimeMode] NVARCHAR(50) NOT NULL CONSTRAINT [LogbookPreferences_sumTimeMode_df] DEFAULT 'whole-minutes',
    [preferredTimeZone] NVARCHAR(50) NOT NULL CONSTRAINT [LogbookPreferences_preferredTimeZone_df] DEFAULT 'UTC',
    [dateInterpretation] NVARCHAR(20) NOT NULL CONSTRAINT [LogbookPreferences_dateInterpretation_df] DEFAULT 'local',
    [showInstructorTime] BIT NOT NULL CONSTRAINT [LogbookPreferences_showInstructorTime_df] DEFAULT 1,
    [showSicTime] BIT NOT NULL CONSTRAINT [LogbookPreferences_showSicTime_df] DEFAULT 1,
    [showHobbsTach] BIT NOT NULL CONSTRAINT [LogbookPreferences_showHobbsTach_df] DEFAULT 0,
    [commonTimeOrder] NVARCHAR(max),
    [telemetryFields] NVARCHAR(max),
    [autoFillTimes] BIT NOT NULL CONSTRAINT [LogbookPreferences_autoFillTimes_df] DEFAULT 1,
    [autoFillLandings] BIT NOT NULL CONSTRAINT [LogbookPreferences_autoFillLandings_df] DEFAULT 1,
    [takeoffSpeedKts] INT CONSTRAINT [LogbookPreferences_takeoffSpeedKts_df] DEFAULT 70,
    [includeHeliports] BIT NOT NULL CONSTRAINT [LogbookPreferences_includeHeliports_df] DEFAULT 0,
    [estimateNight] BIT NOT NULL CONSTRAINT [LogbookPreferences_estimateNight_df] DEFAULT 0,
    [roundNearestTenth] BIT NOT NULL CONSTRAINT [LogbookPreferences_roundNearestTenth_df] DEFAULT 0,
    [nightStartRule] NVARCHAR(50) NOT NULL CONSTRAINT [LogbookPreferences_nightStartRule_df] DEFAULT 'civil-twilight',
    [nightLandingRule] NVARCHAR(50) NOT NULL CONSTRAINT [LogbookPreferences_nightLandingRule_df] DEFAULT 'sunset-plus-60',
    [colorizeSavedSearches] BIT NOT NULL CONSTRAINT [LogbookPreferences_colorizeSavedSearches_df] DEFAULT 0,
    [mapRouteColor] NVARCHAR(20),
    [mapPathColor] NVARCHAR(20),
    [defaultTemplateId] NVARCHAR(36),
    [totalsByCategoryClass] BIT NOT NULL CONSTRAINT [LogbookPreferences_totalsByCategoryClass_df] DEFAULT 1,
    [totalsByModel] BIT NOT NULL CONSTRAINT [LogbookPreferences_totalsByModel_df] DEFAULT 0,
    [totalsByModelFamily] BIT NOT NULL CONSTRAINT [LogbookPreferences_totalsByModelFamily_df] DEFAULT 0,
    [totalsByFeatures] BIT NOT NULL CONSTRAINT [LogbookPreferences_totalsByFeatures_df] DEFAULT 1,
    [currencyAuthorities] NVARCHAR(max),
    [currencyByCategory] BIT NOT NULL CONSTRAINT [LogbookPreferences_currencyByCategory_df] DEFAULT 1,
    [currencyByModel] BIT NOT NULL CONSTRAINT [LogbookPreferences_currencyByModel_df] DEFAULT 0,
    [allowNightTouchAndGo] BIT NOT NULL CONSTRAINT [LogbookPreferences_allowNightTouchAndGo_df] DEFAULT 1,
    [requireDayLandings] BIT NOT NULL CONSTRAINT [LogbookPreferences_requireDayLandings_df] DEFAULT 0,
    [showAr951] BIT NOT NULL CONSTRAINT [LogbookPreferences_showAr951_df] DEFAULT 0,
    [showFar117] BIT NOT NULL CONSTRAINT [LogbookPreferences_showFar117_df] DEFAULT 0,
    [showFar125] BIT NOT NULL CONSTRAINT [LogbookPreferences_showFar125_df] DEFAULT 0,
    [showFar135] BIT NOT NULL CONSTRAINT [LogbookPreferences_showFar135_df] DEFAULT 0,
    [showFar135Duty] BIT NOT NULL CONSTRAINT [LogbookPreferences_showFar135Duty_df] DEFAULT 0,
    [showGroundInstructor] BIT NOT NULL CONSTRAINT [LogbookPreferences_showGroundInstructor_df] DEFAULT 0,
    [expiredCurrencyDisplay] NVARCHAR(50) NOT NULL CONSTRAINT [LogbookPreferences_expiredCurrencyDisplay_df] DEFAULT 'forever',
    [maintenanceDueWindowDays] INT NOT NULL CONSTRAINT [LogbookPreferences_maintenanceDueWindowDays_df] DEFAULT 90,
    [notifyCurrencyWeekly] BIT NOT NULL CONSTRAINT [LogbookPreferences_notifyCurrencyWeekly_df] DEFAULT 0,
    [notifyCurrencyOnExpiry] BIT NOT NULL CONSTRAINT [LogbookPreferences_notifyCurrencyOnExpiry_df] DEFAULT 1,
    [notifyTotalsWeekly] BIT NOT NULL CONSTRAINT [LogbookPreferences_notifyTotalsWeekly_df] DEFAULT 0,
    [notifyTotalsMonthly] BIT NOT NULL CONSTRAINT [LogbookPreferences_notifyTotalsMonthly_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [LogbookPreferences_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [LogbookPreferences_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [LogbookPreferences_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[LogbookTemplate] (
    [id] NVARCHAR(36) NOT NULL,
    [userId] NVARCHAR(36) NOT NULL,
    [name] NVARCHAR(100) NOT NULL,
    [description] NVARCHAR(255),
    [fieldsJson] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [LogbookTemplate_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [LogbookTemplate_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[LogbookSharingLink] (
    [id] NVARCHAR(36) NOT NULL,
    [userId] NVARCHAR(36) NOT NULL,
    [token] NVARCHAR(64) NOT NULL,
    [label] NVARCHAR(100),
    [scope] NVARCHAR(50) NOT NULL CONSTRAINT [LogbookSharingLink_scope_df] DEFAULT 'public',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [LogbookSharingLink_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [revokedAt] DATETIME2,
    CONSTRAINT [LogbookSharingLink_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [LogbookSharingLink_token_key] UNIQUE NONCLUSTERED ([token])
);

-- CreateTable
CREATE TABLE [dbo].[LogbookCustomRule] (
    [id] NVARCHAR(36) NOT NULL,
    [userId] NVARCHAR(36) NOT NULL,
    [name] NVARCHAR(100) NOT NULL,
    [ruleJson] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [LogbookCustomRule_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [LogbookCustomRule_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[LogbookDeadline] (
    [id] NVARCHAR(36) NOT NULL,
    [userId] NVARCHAR(36) NOT NULL,
    [aircraftId] NVARCHAR(36),
    [name] NVARCHAR(100) NOT NULL,
    [dueDate] DATETIME2,
    [dueHours] FLOAT(53),
    [hourType] NVARCHAR(20),
    [notes] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [LogbookDeadline_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [LogbookDeadline_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [LogbookTemplate_userId_idx] ON [dbo].[LogbookTemplate]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [LogbookSharingLink_userId_idx] ON [dbo].[LogbookSharingLink]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [LogbookCustomRule_userId_idx] ON [dbo].[LogbookCustomRule]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [LogbookDeadline_userId_idx] ON [dbo].[LogbookDeadline]([userId]);

-- AddForeignKey
ALTER TABLE [dbo].[LogbookPreferences] ADD CONSTRAINT [LogbookPreferences_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[LogbookTemplate] ADD CONSTRAINT [LogbookTemplate_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[LogbookSharingLink] ADD CONSTRAINT [LogbookSharingLink_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[LogbookCustomRule] ADD CONSTRAINT [LogbookCustomRule_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[LogbookDeadline] ADD CONSTRAINT [LogbookDeadline_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[LogbookDeadline] ADD CONSTRAINT [LogbookDeadline_aircraftId_fkey] FOREIGN KEY ([aircraftId]) REFERENCES [dbo].[AircraftProfile]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

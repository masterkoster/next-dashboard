BEGIN TRY

BEGIN TRAN;

-- AlterTable (guard against existing columns)
IF COL_LENGTH('dbo.LogbookEntry','isDay') IS NULL
  ALTER TABLE [dbo].[LogbookEntry] ADD [isDay] BIT NOT NULL CONSTRAINT [LogbookEntry_isDay_df] DEFAULT 1;
IF COL_LENGTH('dbo.LogbookEntry','safetyPilotName') IS NULL
  ALTER TABLE [dbo].[LogbookEntry] ADD [safetyPilotName] NVARCHAR(100);
IF COL_LENGTH('dbo.LogbookEntry','requiresSafetyPilot') IS NULL
  ALTER TABLE [dbo].[LogbookEntry] ADD [requiresSafetyPilot] BIT NOT NULL CONSTRAINT [LogbookEntry_requiresSafetyPilot_df] DEFAULT 0;
IF COL_LENGTH('dbo.LogbookEntry','groundTrainingReceived') IS NULL
  ALTER TABLE [dbo].[LogbookEntry] ADD [groundTrainingReceived] FLOAT(53) NOT NULL CONSTRAINT [LogbookEntry_groundTrainingReceived_df] DEFAULT 0;
IF COL_LENGTH('dbo.LogbookEntry','simTrainingReceived') IS NULL
  ALTER TABLE [dbo].[LogbookEntry] ADD [simTrainingReceived] FLOAT(53) NOT NULL CONSTRAINT [LogbookEntry_simTrainingReceived_df] DEFAULT 0;
IF COL_LENGTH('dbo.LogbookEntry','trainingDeviceId') IS NULL
  ALTER TABLE [dbo].[LogbookEntry] ADD [trainingDeviceId] NVARCHAR(100);
IF COL_LENGTH('dbo.LogbookEntry','trainingDeviceLocation') IS NULL
  ALTER TABLE [dbo].[LogbookEntry] ADD [trainingDeviceLocation] NVARCHAR(100);
IF COL_LENGTH('dbo.LogbookEntry','isSimulator') IS NULL
  ALTER TABLE [dbo].[LogbookEntry] ADD [isSimulator] BIT NOT NULL CONSTRAINT [LogbookEntry_isSimulator_df] DEFAULT 0;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

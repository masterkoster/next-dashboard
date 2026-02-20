-- Migration: Add Aircraft Sales fields to MarketplaceListing + AircraftInquiry table
-- Run this SQL on your Azure SQL (SQL Server) database.

-- 1. Add aircraft-specific columns to MarketplaceListing
IF COL_LENGTH('[MarketplaceListing]', 'nNumber') IS NULL
  ALTER TABLE [MarketplaceListing] ADD nNumber NVARCHAR(10) NULL;

IF COL_LENGTH('[MarketplaceListing]', 'make') IS NULL
  ALTER TABLE [MarketplaceListing] ADD make NVARCHAR(100) NULL;

IF COL_LENGTH('[MarketplaceListing]', 'model') IS NULL
  ALTER TABLE [MarketplaceListing] ADD model NVARCHAR(100) NULL;

IF COL_LENGTH('[MarketplaceListing]', 'year') IS NULL
  ALTER TABLE [MarketplaceListing] ADD year INT NULL;

IF COL_LENGTH('[MarketplaceListing]', 'totalTime') IS NULL
  ALTER TABLE [MarketplaceListing] ADD totalTime INT NULL;

IF COL_LENGTH('[MarketplaceListing]', 'engineTime') IS NULL
  ALTER TABLE [MarketplaceListing] ADD engineTime INT NULL;

IF COL_LENGTH('[MarketplaceListing]', 'propTime') IS NULL
  ALTER TABLE [MarketplaceListing] ADD propTime INT NULL;

IF COL_LENGTH('[MarketplaceListing]', 'airframeTime') IS NULL
  ALTER TABLE [MarketplaceListing] ADD airframeTime INT NULL;

IF COL_LENGTH('[MarketplaceListing]', 'annualDue') IS NULL
  ALTER TABLE [MarketplaceListing] ADD annualDue DATETIME NULL;

IF COL_LENGTH('[MarketplaceListing]', 'registrationType') IS NULL
  ALTER TABLE [MarketplaceListing] ADD registrationType NVARCHAR(50) NULL;

IF COL_LENGTH('[MarketplaceListing]', 'airworthiness') IS NULL
  ALTER TABLE [MarketplaceListing] ADD airworthiness NVARCHAR(50) NULL;

IF COL_LENGTH('[MarketplaceListing]', 'fuelType') IS NULL
  ALTER TABLE [MarketplaceListing] ADD fuelType NVARCHAR(20) NULL;

IF COL_LENGTH('[MarketplaceListing]', 'avionics') IS NULL
  ALTER TABLE [MarketplaceListing] ADD avionics NVARCHAR(MAX) NULL;

IF COL_LENGTH('[MarketplaceListing]', 'features') IS NULL
  ALTER TABLE [MarketplaceListing] ADD features NVARCHAR(MAX) NULL;

IF COL_LENGTH('[MarketplaceListing]', 'upgrades') IS NULL
  ALTER TABLE [MarketplaceListing] ADD upgrades NVARCHAR(MAX) NULL;

IF COL_LENGTH('[MarketplaceListing]', 'sellerType') IS NULL
  ALTER TABLE [MarketplaceListing] ADD sellerType NVARCHAR(20) NULL;

IF COL_LENGTH('[MarketplaceListing]', 'isVerified') IS NULL
  ALTER TABLE [MarketplaceListing] ADD isVerified BIT NOT NULL DEFAULT 0;

IF COL_LENGTH('[MarketplaceListing]', 'verifiedAt') IS NULL
  ALTER TABLE [MarketplaceListing] ADD verifiedAt DATETIME NULL;

IF COL_LENGTH('[MarketplaceListing]', 'faaData') IS NULL
  ALTER TABLE [MarketplaceListing] ADD faaData NVARCHAR(MAX) NULL;

IF COL_LENGTH('[MarketplaceListing]', 'videoUrl') IS NULL
  ALTER TABLE [MarketplaceListing] ADD videoUrl NVARCHAR(500) NULL;

-- 2. Add new listing type
-- (Already supports via NVARCHAR - just insert "AIRCRAFT_SALE" type)

-- 3. Create AircraftInquiry table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AircraftInquiry')
BEGIN
  CREATE TABLE [AircraftInquiry] (
    [id] NVARCHAR(36) NOT NULL PRIMARY KEY DEFAULT NEWID(),
    [listingId] NVARCHAR(36) NOT NULL,
    [buyerId] NVARCHAR(36) NOT NULL,
    [message] NVARCHAR(MAX) NOT NULL,
    [offerAmount] INT NULL,
    [status] NVARCHAR(20) NOT NULL DEFAULT 'unread',
    [createdAt] DATETIME NOT NULL DEFAULT GETDATE(),
    [updatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_AircraftInquiry_Listing] FOREIGN KEY ([listingId]) REFERENCES [MarketplaceListing]([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AircraftInquiry_Buyer] FOREIGN KEY ([buyerId]) REFERENCES [User]([id])
  );
  
  CREATE NONCLUSTERED INDEX [IX_AircraftInquiry_listingId] ON [AircraftInquiry]([listingId]);
  CREATE NONCLUSTERED INDEX [IX_AircraftInquiry_buyerId] ON [AircraftInquiry]([buyerId]);
  CREATE NONCLUSTERED INDEX [IX_AircraftInquiry_status] ON [AircraftInquiry]([status]);
END

PRINT 'Aircraft sales migration completed successfully!';

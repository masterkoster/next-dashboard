-- Migration: Add LogbookEntry table
-- Run this SQL on your Azure SQL database

-- Create LogbookEntry table
CREATE TABLE [LogbookEntry] (
    [id] NVARCHAR(36) NOT NULL PRIMARY KEY,
    [userId] NVARCHAR(36) NOT NULL,
    [date] DATETIME NOT NULL,
    [aircraft] NVARCHAR(100) NOT NULL,
    [routeFrom] NVARCHAR(10) NOT NULL,
    [routeTo] NVARCHAR(10) NOT NULL,
    [totalTime] FLOAT NOT NULL DEFAULT 0,
    [soloTime] FLOAT NOT NULL DEFAULT 0,
    [dualGiven] FLOAT NOT NULL DEFAULT 0,
    [dualReceived] FLOAT NOT NULL DEFAULT 0,
    [nightTime] FLOAT NOT NULL DEFAULT 0,
    [instrumentTime] FLOAT NOT NULL DEFAULT 0,
    [crossCountryTime] FLOAT NOT NULL DEFAULT 0,
    [dayLandings] INT NOT NULL DEFAULT 0,
    [nightLandings] INT NOT NULL DEFAULT 0,
    [remarks] NVARCHAR(MAX) NULL,
    [instructor] NVARCHAR(100) NULL,
    [flightPlanId] NVARCHAR(36) NULL,
    [createdAt] DATETIME NOT NULL DEFAULT GETDATE(),
    [updatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_LogbookEntry_User] FOREIGN KEY ([userId]) REFERENCES [User]([id]) ON DELETE CASCADE
);

-- Create index on userId for faster queries
CREATE INDEX [IX_LogbookEntry_userId] ON [LogbookEntry]([userId]);

-- Create index on date for sorting
CREATE INDEX [IX_LogbookEntry_date] ON [LogbookEntry]([date]);

PRINT 'LogbookEntry table created successfully!';

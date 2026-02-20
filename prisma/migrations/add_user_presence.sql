-- Migration: Add UserPresence table for online status tracking
-- Run this SQL on your Azure SQL (SQL Server) database.

-- Create UserPresence table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserPresence')
BEGIN
  CREATE TABLE [UserPresence] (
    [id] NVARCHAR(36) NOT NULL PRIMARY KEY DEFAULT NEWID(),
    [userId] NVARCHAR(36) NOT NULL UNIQUE,
    [isOnline] BIT NOT NULL DEFAULT 0,
    [lastSeenAt] DATETIME NOT NULL DEFAULT GETDATE(),
    [updatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_UserPresence_User] FOREIGN KEY ([userId]) REFERENCES [User]([id]) ON DELETE CASCADE
  );
  
  CREATE NONCLUSTERED INDEX [IX_UserPresence_isOnline] ON [UserPresence]([isOnline]);
  CREATE NONCLUSTERED INDEX [IX_UserPresence_userId] ON [UserPresence]([userId]);
END

PRINT 'UserPresence migration completed successfully!';

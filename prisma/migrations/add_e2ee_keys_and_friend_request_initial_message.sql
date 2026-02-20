-- Migration: Add E2EE public key + encrypted friend-request message
-- Run this SQL on your Azure SQL (SQL Server) database.

-- User: store public key as JSON string (JWK)
IF COL_LENGTH('[User]', 'e2eePublicKeyJwk') IS NULL
  ALTER TABLE [User] ADD e2eePublicKeyJwk NVARCHAR(MAX) NULL;

IF COL_LENGTH('[User]', 'e2eePublicKeyUpdatedAt') IS NULL
  ALTER TABLE [User] ADD e2eePublicKeyUpdatedAt DATETIME NULL;

-- FriendRequest: optional encrypted initial message envelope
IF COL_LENGTH('[FriendRequest]', 'initialMessageEnvelope') IS NULL
  ALTER TABLE [FriendRequest] ADD initialMessageEnvelope NVARCHAR(MAX) NULL;

PRINT 'E2EE migration completed successfully!';

-- Migration: Add image field to User table
-- Run this SQL on your Azure SQL (SQL Server) database.

IF COL_LENGTH('[User]', 'image') IS NULL
  ALTER TABLE [User] ADD image NVARCHAR(500) NULL;

PRINT 'User image column added successfully!';

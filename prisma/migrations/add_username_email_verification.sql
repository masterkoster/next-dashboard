-- Migration: Add username and email verification columns
-- Run this SQL on your Azure SQL database

-- Step 1: Add new columns (nullable first)
ALTER TABLE [User] ADD username NVARCHAR(50) NULL;
ALTER TABLE [User] ADD emailVerified DATETIME NULL;
ALTER TABLE [User] ADD verifyToken NVARCHAR(255) NULL;
ALTER TABLE [User] ADD verifyTokenExpiry DATETIME NULL;

-- Step 2: Update existing users with auto-generated usernames and mark as verified
-- This auto-fills existing users so they can keep using the app
UPDATE [User] SET 
  username = CASE 
    WHEN email LIKE '%@%' THEN LOWER(REPLACE(REPLACE(REPLACE(email, '@', '_'), '.', '_'), '+', '_'))
    ELSE LOWER('user_' + CAST(id AS NVARCHAR(36)))
  END,
  emailVerified = createdAt  -- Auto-verify all existing users
WHERE username IS NULL;

-- Step 3: Handle any duplicate usernames by appending numbers
DECLARE @Counter INT = 1;
WHILE EXISTS (SELECT 1 FROM [User] GROUP BY username HAVING COUNT(*) > 1)
BEGIN
  UPDATE u1 SET 
    username = u1.username + '_' + CAST(@Counter AS NVARCHAR(10))
  FROM [User] u1
  INNER JOIN (
    SELECT username, MIN(id) as min_id
    FROM [User]
    GROUP BY username
    HAVING COUNT(*) > 1
  ) u2 ON u1.username = u2.username AND u1.id <> u2.min_id;
  
  SET @Counter = @Counter + 1;
  IF @Counter > 100 BREAK; -- Safety limit
END

-- Step 4: Create unique index on username
CREATE UNIQUE INDEX IX_User_username ON [User](username) WHERE username IS NOT NULL;

-- Step 5: Verify the migration
SELECT 
  COUNT(*) as total_users,
  COUNT(username) as users_with_username,
  COUNT(emailVerified) as verified_users
FROM [User];

PRINT 'Migration completed successfully!';

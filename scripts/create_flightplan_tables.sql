-- FlightPlan table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FlightPlan')
BEGIN
    CREATE TABLE [FlightPlan] (
        [id] NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
        [userId] NVARCHAR(36) NOT NULL,
        [name] NVARCHAR(255),
        [callsign] NVARCHAR(20),
        [aircraftType] NVARCHAR(20),
        [departureIcao] NVARCHAR(10),
        [departureTime] DATETIME2,
        [departureFuel] INT,
        [arrivalIcao] NVARCHAR(10),
        [alternateIcao] NVARCHAR(10),
        [cruisingAlt] INT,
        [route] NVARCHAR(MAX),
        [remarks] NVARCHAR(MAX),
        [soulsOnBoard] INT,
        [rawGpx] NVARCHAR(MAX),
        [rawFpl] NVARCHAR(MAX),
        [isFiled] BIT DEFAULT 0,
        [filedAt] DATETIME2,
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [updatedAt] DATETIME2 DEFAULT GETDATE()
    );
    
    -- FlightPlanWaypoint table
    CREATE TABLE [FlightPlanWaypoint] (
        [id] NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
        [flightPlanId] NVARCHAR(36) NOT NULL,
        [sequence] INT NOT NULL,
        [icao] NVARCHAR(10),
        [waypointId] NVARCHAR(20),
        [latitude] FLOAT NOT NULL,
        [longitude] FLOAT NOT NULL,
        [altitude] INT,
        [flightType] NVARCHAR(10),
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT [FK_Waypoint_FlightPlan] FOREIGN KEY ([flightPlanId]) REFERENCES [FlightPlan]([id]) ON DELETE CASCADE
    );
    
    PRINT 'FlightPlan tables created successfully';
END
ELSE
BEGIN
    PRINT 'FlightPlan tables already exist';
END

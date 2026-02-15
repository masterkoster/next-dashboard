'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  demoGroups, 
  demoBookings, 
  demoFlightLogs, 
  demoMaintenance,
  demoUsers,
  DemoGroup,
  DemoBooking,
  DemoFlightLog,
  DemoMaintenance
} from './demoData';

interface DemoContextType {
  isDemo: boolean;
  groups: DemoGroup[];
  bookings: DemoBooking[];
  flightLogs: DemoFlightLog[];
  maintenance: DemoMaintenance[];
  currentUser: { id: string; name: string; email: string };
  showDemoPopup: boolean;
  setShowDemoPopup: (show: boolean) => void;
  // State updaters for CRUD operations (in-memory only)
  addBooking: (booking: Omit<DemoBooking, 'id' | 'createdAt'>) => void;
  addFlightLog: (log: Omit<DemoFlightLog, 'id' | 'createdAt'>) => void;
  updateAircraftStatus: (groupId: string, aircraftId: string, status: string) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(false);
  const [showDemoPopup, setShowDemoPopup] = useState(false);
  const [groups, setGroups] = useState<DemoGroup[]>([]);
  const [bookings, setBookings] = useState<DemoBooking[]>([]);
  const [flightLogs, setFlightLogs] = useState<DemoFlightLog[]>([]);
  const [maintenance, setMaintenance] = useState<DemoMaintenance[]>([]);

  // Check for demo mode from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'true') {
      setIsDemo(true);
      setShowDemoPopup(true);
      // Load demo data
      setGroups(demoGroups);
      setBookings(demoBookings);
      setFlightLogs(demoFlightLogs);
      setMaintenance(demoMaintenance);
    }
  }, []);

  // Generate unique ID for new records
  const generateId = () => `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // CRUD operations that stay in memory
  const addBooking = (booking: Omit<DemoBooking, 'id' | 'createdAt'>) => {
    const newBooking: DemoBooking = {
      ...booking,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setBookings(prev => [newBooking, ...prev]);
  };

  const addFlightLog = (log: Omit<DemoFlightLog, 'id' | 'createdAt'>) => {
    const newLog: DemoFlightLog = {
      ...log,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setFlightLogs(prev => [newLog, ...prev]);
  };

  const updateAircraftStatus = (groupId: string, aircraftId: string, status: string) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          aircraft: group.aircraft.map(aircraft => {
            if (aircraft.id === aircraftId) {
              const notes = aircraft.aircraftNotes ? JSON.parse(aircraft.aircraftNotes) : {};
              return {
                ...aircraft,
                status,
                aircraftNotes: JSON.stringify({ ...notes, aircraftStatus: status }),
              };
            }
            return aircraft;
          }),
        };
      }
      return group;
    }));
  };

  // Current user is the demo admin
  const currentUser = demoUsers[0];

  return (
    <DemoContext.Provider 
      value={{
        isDemo,
        groups,
        bookings,
        flightLogs,
        maintenance,
        currentUser,
        showDemoPopup,
        setShowDemoPopup,
        addBooking,
        addFlightLog,
        updateAircraftStatus,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

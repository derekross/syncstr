import { useState } from 'react';
import type { NostrEvent } from '@nostrify/nostrify';
import type { ProfileData } from './useProfileData';

export interface BackupModeState {
  isBackupMode: boolean;
  backupData: ProfileData | null;
  backupEvents: NostrEvent[];
  backupSource: string;
}

export function useBackupMode() {
  const [backupState, setBackupState] = useState<BackupModeState>({
    isBackupMode: false,
    backupData: null,
    backupEvents: [],
    backupSource: '',
  });

  const enterBackupMode = (events: NostrEvent[]) => {
    // Convert events array back to ProfileData structure
    const profileData: ProfileData = {};
    
    for (const event of events) {
      switch (event.kind) {
        case 0:
          profileData.metadata = event;
          break;
        case 3:
          profileData.contacts = event;
          break;
        case 10000:
          profileData.muteList = event;
          break;
        case 10001:
          profileData.pinnedNotes = event;
          break;
        case 10002:
          profileData.relayList = event;
          break;
        case 10003:
          profileData.bookmarks = event;
          break;
        case 10004:
          profileData.communities = event;
          break;
        case 10007:
          profileData.searchRelays = event;
          break;
        case 10015:
          profileData.interests = event;
          break;
        case 10030:
          profileData.emojiList = event;
          break;
        case 10050:
          profileData.dmRelays = event;
          break;
      }
    }

    setBackupState({
      isBackupMode: true,
      backupData: profileData,
      backupEvents: events,
      backupSource: 'Uploaded Backup',
    });
  };

  const exitBackupMode = () => {
    setBackupState({
      isBackupMode: false,
      backupData: null,
      backupEvents: [],
      backupSource: '',
    });
  };

  return {
    ...backupState,
    enterBackupMode,
    exitBackupMode,
  };
}
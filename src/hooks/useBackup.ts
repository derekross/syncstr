import { useState } from 'react';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';
import type { ProfileData } from './useProfileData';
import { useToast } from './useToast';

export interface BackupData {
  version: string;
  timestamp: number;
  npub: string;
  pubkey: string;
  events: NostrEvent[];
  metadata: {
    eventCounts: Record<number, number>;
    totalEvents: number;
    createdAt: string;
  };
}

export function useBackup() {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const { toast } = useToast();

  const createBackup = async (profileData: ProfileData, pubkey: string): Promise<void> => {
    try {
      setIsCreatingBackup(true);

      // Collect all events from profile data
      const events = Object.values(profileData).filter(Boolean) as NostrEvent[];

      if (events.length === 0) {
        throw new Error('No profile data to backup');
      }

      // Create event counts by kind
      const eventCounts: Record<number, number> = {};
      events.forEach(event => {
        eventCounts[event.kind] = (eventCounts[event.kind] || 0) + 1;
      });

      // Generate npub for the backup
      const npub = nip19.npubEncode(pubkey);

      // Create backup data structure
      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: Date.now(),
        npub,
        pubkey,
        events,
        metadata: {
          eventCounts,
          totalEvents: events.length,
          createdAt: new Date().toISOString(),
        }
      };

      // Create filename with timestamp and npub prefix
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const npubPrefix = npub.slice(0, 12); // First 12 chars of npub
      const filename = `syncstr-backup-${npubPrefix}-${date}.json`;

      // Create and download the file
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);

      toast({
        title: 'Backup Created',
        description: `Downloaded ${events.length} events to ${filename}`,
      });

    } catch (error) {
      console.error('Backup creation failed:', error);
      toast({
        title: 'Backup Failed',
        description: error instanceof Error ? error.message : 'Failed to create backup',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const validateBackup = (backupData: unknown): BackupData => {
    // Check if it's an object
    if (!backupData || typeof backupData !== 'object') {
      throw new Error('Invalid backup file: not a valid JSON object');
    }

    const data = backupData as Record<string, unknown>;

    // Check required fields
    if (!data.version || !data.timestamp || !data.npub || !data.pubkey || !data.events) {
      throw new Error('Invalid backup file: missing required fields');
    }

    // Check version compatibility
    if (typeof data.version !== 'string' || !data.version.startsWith('1.')) {
      throw new Error('Backup version not supported. Please update SyncStr.');
    }

    // Validate events array
    if (!Array.isArray(data.events)) {
      throw new Error('Invalid backup file: events must be an array');
    }

    // Validate each event has required fields
    for (const event of data.events) {
      if (!event || typeof event !== 'object') {
        throw new Error('Invalid backup file: events are malformed');
      }
      const evt = event as Record<string, unknown>;
      if (!evt.id || !evt.pubkey || typeof evt.kind !== 'number' || !evt.created_at || !evt.sig) {
        throw new Error('Invalid backup file: events are malformed');
      }
    }

    return data as unknown as BackupData;
  };

  const parseBackupFile = async (file: File): Promise<BackupData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const backupData = JSON.parse(content);
          const validatedBackup = validateBackup(backupData);
          resolve(validatedBackup);
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Failed to parse backup file'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read backup file'));
      };

      reader.readAsText(file);
    });
  };

  const restoreFromBackup = async (file: File): Promise<NostrEvent[]> => {
    try {
      setIsRestoringBackup(true);

      const backupData = await parseBackupFile(file);

      toast({
        title: 'Backup Loaded',
        description: `Found ${backupData.events.length} events from ${new Date(backupData.timestamp).toLocaleDateString()}`,
      });

      return backupData.events;

    } catch (error) {
      console.error('Backup restoration failed:', error);
      toast({
        title: 'Restore Failed',
        description: error instanceof Error ? error.message : 'Failed to restore from backup',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsRestoringBackup(false);
    }
  };

  return {
    createBackup,
    restoreFromBackup,
    isCreatingBackup,
    isRestoringBackup,
  };
}
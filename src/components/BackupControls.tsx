import { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DownloadIcon, UploadIcon, FileIcon, ShieldCheckIcon } from 'lucide-react';
import { useBackup } from '@/hooks/useBackup';
import type { NostrEvent } from '@nostrify/nostrify';
import type { ProfileData } from '@/hooks/useProfileData';

interface BackupControlsProps {
  profileData: ProfileData | null | undefined;
  pubkey: string;
  onBackupRestore: (events: NostrEvent[]) => void;
}

export function BackupControls({ profileData, pubkey, onBackupRestore }: BackupControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createBackup, restoreFromBackup, isCreatingBackup, isRestoringBackup } = useBackup();

  const handleDownloadBackup = async () => {
    if (!profileData) return;
    await createBackup(profileData, pubkey);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const events = await restoreFromBackup(file);
      onBackupRestore(events);
    } catch {
      // Error handling is done in the useBackup hook
    }

    // Reset file input
    event.target.value = '';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const availableEvents = profileData ? Object.values(profileData).filter(Boolean) : [];
  const hasData = availableEvents.length > 0;

  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
          <div>
            <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
              Backup & Restore
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Download your profile data for safekeeping or restore from a backup
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Download Backup */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-3">
            <DownloadIcon className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Download Backup</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {hasData ? `Save ${availableEvents.length} profile events as JSON` : 'No profile data to backup'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleDownloadBackup}
            disabled={!hasData || isCreatingBackup}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isCreatingBackup ? 'Creating...' : 'Download'}
          </Button>
        </div>

        <Separator className="bg-blue-200 dark:bg-blue-700" />

        {/* Upload Backup */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-3">
            <UploadIcon className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Restore from Backup</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Load profile data from a previously downloaded backup file
              </p>
            </div>
          </div>
          <Button
            onClick={handleUploadClick}
            disabled={isRestoringBackup}
            size="sm"
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
          >
            {isRestoringBackup ? 'Loading...' : 'Upload'}
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Info Section */}
        <div className="mt-4 p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700">
          <div className="flex items-start gap-2">
            <FileIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Backup Features:</p>
              <ul className="space-y-0.5">
                <li>• Complete offline backup of all profile data</li>
                <li>• Use backups to sync to new relays without connecting to source</li>
                <li>• Secure JSON format with event validation</li>
                <li>• Compatible with all SyncStr versions</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRightIcon, RotateCcwIcon, CheckIcon, XIcon } from 'lucide-react';
import type { NostrEvent } from '@nostrify/nostrify';

interface SyncButtonProps {
  sourceRelay: string;
  targetRelay: string;
  selectedEvents: NostrEvent[];
  onSync: () => void;
  isLoading: boolean;
  syncResult?: {
    successCount: number;
    errorCount: number;
    total: number;
  };
}

export function SyncButton({
  sourceRelay,
  targetRelay,
  selectedEvents,
  onSync,
  isLoading,
  syncResult
}: SyncButtonProps) {
  const canSync = sourceRelay && targetRelay && selectedEvents.length > 0 && !isLoading;

  const getProgressValue = () => {
    if (!syncResult) return 0;
    return ((syncResult.successCount + syncResult.errorCount) / syncResult.total) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <RotateCcwIcon className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Sync Profile Data</CardTitle>
        </div>
        <CardDescription>
          Copy selected profile data from source to target relay
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Relay Flow Visualization */}
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <div className="flex-1 text-center">
            <p className="text-sm font-medium">Source</p>
            <p className="text-xs text-muted-foreground font-mono break-all">
              {sourceRelay || 'Not selected'}
            </p>
          </div>
          <ArrowRightIcon className="h-6 w-6 text-primary flex-shrink-0" />
          <div className="flex-1 text-center">
            <p className="text-sm font-medium">Target</p>
            <p className="text-xs text-muted-foreground font-mono break-all">
              {targetRelay || 'Not selected'}
            </p>
          </div>
        </div>

        {/* Selected Events Summary */}
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm font-medium text-primary">
            {selectedEvents.length} events selected for sync
          </p>
          {selectedEvents.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedEvents.map((event) => (
                <span
                  key={event.id}
                  className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                >
                  Kind {event.kind}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Progress Bar (shown during sync) */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Syncing events...</span>
              {syncResult && (
                <span>{syncResult.successCount + syncResult.errorCount}/{syncResult.total}</span>
              )}
            </div>
            <Progress value={getProgressValue()} className="w-full" />
          </div>
        )}

        {/* Sync Results */}
        {syncResult && !isLoading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {syncResult.errorCount === 0 ? (
                <CheckIcon className="h-4 w-4 text-green-600" />
              ) : (
                <XIcon className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm font-medium">
                Sync {syncResult.errorCount === 0 ? 'Complete' : 'Partial'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>✅ {syncResult.successCount} events synced successfully</p>
              {syncResult.errorCount > 0 && (
                <p>❌ {syncResult.errorCount} events failed to sync</p>
              )}
            </div>
          </div>
        )}

        {/* Sync Button */}
        <Button
          onClick={onSync}
          disabled={!canSync}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <RotateCcwIcon className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RotateCcwIcon className="mr-2 h-4 w-4" />
              Sync {selectedEvents.length} Events
            </>
          )}
        </Button>

        {!canSync && !isLoading && (
          <p className="text-xs text-muted-foreground text-center">
            {!sourceRelay && 'Select a source relay, '}
            {!targetRelay && 'select a target relay, '}
            {selectedEvents.length === 0 && 'select events to sync'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
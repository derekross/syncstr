import { useMutation } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { NPool, NRelay1 } from '@nostrify/nostrify';
import type { NostrEvent } from '@nostrify/nostrify';
import { useToast } from '@/hooks/useToast';

export interface SyncProfileData {
  events: NostrEvent[];
  targetRelay: string;
}

export function useSyncProfile() {
  const { nostr } = useNostr();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ events, targetRelay }: SyncProfileData) => {
      console.log('🚀 Starting sync:', { eventCount: events.length, targetRelay });
      
      if (events.length === 0) {
        throw new Error('No events to sync');
      }

      // Try using global nostr instance first (like we did for queries)
      console.log('🧪 Testing global nostr for publishing...');
      let successCount = 0;
      let errorCount = 0;
      const results: Array<{ event: NostrEvent; success: boolean; error?: unknown }> = [];

      // Try global nostr first
      for (const event of events) {
        try {
          console.log(`📤 Publishing event ${event.kind} (${event.id.slice(0, 8)}...) via global nostr`);
          await nostr.event(event, { signal: AbortSignal.timeout(15000) });
          console.log(`✅ Successfully published event ${event.kind}`);
          results.push({ event, success: true });
          successCount++;
        } catch (globalError) {
          console.warn(`⚠️ Global nostr failed for event ${event.kind}:`, globalError);
          
          // Fallback to custom pool for this specific event
          try {
            console.log(`🔄 Falling back to custom pool for event ${event.kind}`);
            const customPool = new NPool({
              open(url: string) {
                console.log('🔌 Opening custom connection for sync to:', url);
                return new NRelay1(url);
              },
              reqRouter() {
                return new Map([[targetRelay, []]]);
              },
              eventRouter() {
                return [targetRelay];
              },
            });

            await customPool.event(event, { signal: AbortSignal.timeout(15000) });
            console.log(`✅ Custom pool succeeded for event ${event.kind}`);
            results.push({ event, success: true });
            successCount++;
          } catch (customError) {
            console.error(`❌ Both methods failed for event ${event.kind}:`, { globalError, customError });
            results.push({ event, success: false, error: customError });
            errorCount++;
          }
        }
      }

      console.log('📊 Sync results:', { successCount, errorCount, total: events.length });

      return {
        results,
        successCount,
        errorCount,
        total: events.length,
      };
    },
    onSuccess: (data) => {
      const { successCount, errorCount, total } = data;

      if (errorCount === 0) {
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${successCount} events.`,
        });
      } else if (successCount > 0) {
        toast({
          title: "Partial Sync",
          description: `Synced ${successCount}/${total} events. ${errorCount} failed.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sync Failed",
          description: `Failed to sync any events to the target relay.`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Sync Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
}
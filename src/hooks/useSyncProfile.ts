import { useMutation } from '@tanstack/react-query';
import { NPool, NRelay1 } from '@nostrify/nostrify';
import type { NostrEvent } from '@nostrify/nostrify';
import { useToast } from '@/hooks/useToast';
import { useAppContext } from '@/hooks/useAppContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export interface SyncProfileData {
  events: NostrEvent[];
  targetRelay: string;
}

export function useSyncProfile() {
  const { toast } = useToast();
  const { config } = useAppContext();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ events, targetRelay }: SyncProfileData) => {
      console.log('🚀 Starting sync:', { eventCount: events.length, targetRelay, defaultRelay: config.relayUrl });
      
      if (events.length === 0) {
        throw new Error('No events to sync');
      }

      if (!user) {
        throw new Error('User must be logged in to sync profile');
      }

      if (!targetRelay || (!targetRelay.startsWith('wss://') && !targetRelay.startsWith('ws://'))) {
        throw new Error('Invalid target relay URL');
      }

      let successCount = 0;
      let errorCount = 0;
      const results: Array<{ event: NostrEvent; success: boolean; usedRelay: string; error?: unknown }> = [];

      const createPool = (relayUrl: string) => {
        return new NPool({
          open(url: string) {
            console.log(`🔌 Opening connection to relay: ${url}`);
            return new NRelay1(url, {
              auth: async (challenge: string) => {
                if (!user?.signer) {
                  throw new Error('No signer available for relay authentication (NIP-42)');
                }
                console.log(`🔐 Responding to NIP-42 AUTH challenge from ${url}`);
                const event: Omit<NostrEvent, 'id' | 'pubkey' | 'sig'> = {
                  kind: 22242,
                  created_at: Math.floor(Date.now() / 1000),
                  tags: [
                    ['relay', url],
                    ['challenge', challenge],
                  ],
                  content: '',
                };
                return await user.signer.signEvent(event);
              },
            });
          },
          reqRouter() {
            return new Map([[relayUrl, []]]);
          },
          eventRouter() {
            return [relayUrl];
          },
        });
      };

      const targetPool = createPool(targetRelay);
      const fallbackPool = config.relayUrl !== targetRelay ? createPool(config.relayUrl) : null;

      const publishPromises = events.map(async (event) => {
        let eventSuccess = false;
        let eventError: unknown = null;
        let usedRelay = '';

        const eventDesc = event.tags.find(t => t[0] === 'alt')?.[1] || 
          (event.content.trim() ? event.content.slice(0, 40) + (event.content.length > 40 ? '...' : '') : 'No description');

        // 1. Try target relay first
        try {
          console.log(`📤 Publishing event ${event.kind} (${event.id.slice(0, 8)}..., "${eventDesc}") to TARGET relay: ${targetRelay}`);
          await targetPool.event(event, { signal: AbortSignal.timeout(15000) });
          console.log(`✅ Successfully published event ${event.kind} ("${eventDesc}") to TARGET relay: ${targetRelay}`);
          eventSuccess = true;
          usedRelay = targetRelay;
        } catch (targetError) {
          console.warn(`⚠️ TARGET relay failed for event ${event.kind} (${event.id.slice(0, 8)}..., "${eventDesc}") (${targetRelay}):`, targetError);
          
          // 2. Fallback to default relay if different from target
          if (fallbackPool) {
            try {
              console.log(`🔄 Falling back to DEFAULT relay for event ${event.kind} ("${eventDesc}"): ${config.relayUrl}`);
              await fallbackPool.event(event, { signal: AbortSignal.timeout(15000) });
              console.log(`✅ Successfully published event ${event.kind} ("${eventDesc}") to DEFAULT relay: ${config.relayUrl}`);
              eventSuccess = true;
              usedRelay = config.relayUrl;
            } catch (fallbackError) {
              console.error(`❌ Both TARGET (${targetRelay}) and DEFAULT (${config.relayUrl}) relays failed for event ${event.kind} ("${eventDesc}"):`, { targetError, fallbackError });
              eventError = fallbackError;
            }
          } else {
            eventError = targetError;
          }
        }

        return { event, success: eventSuccess, usedRelay, error: eventError };
      });

      const settledResults = await Promise.allSettled(publishPromises);

      for (const result of settledResults) {
        if (result.status === 'fulfilled') {
          const res = result.value;
          if (res.success) {
            successCount++;
          } else {
            errorCount++;
          }
          results.push(res);
        } else {
          errorCount++;
          console.error('Unexpected promise rejection during event publishing:', result.reason);
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
          description: `Failed to sync any events.`,
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
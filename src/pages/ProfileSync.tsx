import { useState, useEffect } from 'react';
import { nip19 } from 'nostr-tools';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useProfileData } from '@/hooks/useProfileData';
import { useSyncProfile } from '@/hooks/useSyncProfile';
import { useRelayConnection } from '@/hooks/useRelayConnection';
import { LoginArea } from '@/components/auth/LoginArea';
import { RelayInput } from '@/components/RelayInput';
import { ProfileDataCard } from '@/components/ProfileDataCard';
import { SyncButton } from '@/components/SyncButton';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { RotateCcwIcon, UserIcon, InfoIcon } from 'lucide-react';
import type { NostrEvent } from '@nostrify/nostrify';

export function ProfileSync() {
  const { user } = useCurrentUser();
  const [sourceRelay, setSourceRelay] = useState('');
  const [targetRelay, setTargetRelay] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const { testConnection, getConnectionState } = useRelayConnection();

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile
  } = useProfileData(user?.pubkey, sourceRelay);

  const {
    mutate: syncProfile,
    isPending: isSyncing,
    data: syncResult
  } = useSyncProfile();

  // Reset selected events when source relay changes
  useEffect(() => {
    setSelectedEvents(new Set());
  }, [sourceRelay]);

  const handleSelectEvents = (events: NostrEvent[]) => {
    setSelectedEvents(new Set(events.map(e => e.id)));
  };

  const handleSync = () => {
    if (!profileData) return;

    const eventsToSync = Object.values(profileData)
      .filter(Boolean)
      .filter(event => selectedEvents.has(event.id)) as NostrEvent[];

    syncProfile({
      events: eventsToSync,
      targetRelay,
    });
  };

  const handleSourceRelayChange = (relay: string) => {
    setSourceRelay(relay);
    // Trigger a refetch when the relay changes
    if (user?.pubkey) {
      refetchProfile();
    }
  };

  const handleTargetRelayChange = async (relay: string) => {
    setTargetRelay(relay);
    // Test the connection to the target relay
    if (relay) {
      await testConnection(relay);
    }
  };

  const selectedEventsArray = profileData
    ? Object.values(profileData).filter(Boolean).filter(event => selectedEvents.has(event.id)) as NostrEvent[]
    : [];

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Nostr Profile Sync
            </h1>
            <p className="text-muted-foreground">
              Synchronize your profile data between Nostr relays
            </p>
          </div>

          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <UserIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Login Required</h3>
              <p className="text-muted-foreground mb-6">
                Please log in with your Nostr account to sync your profile data
              </p>
              <LoginArea className="max-w-60 mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-3">
          <RotateCcwIcon className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Profile Sync
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Broadcast and sync your Nostr profile metadata, contact lists, and preferences between relays
        </p>

        {/* User Info */}
        <Card className="max-w-md mx-auto">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Logged in as:</span>
              </div>
              <LoginArea className="max-w-32" />
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-2 break-all">
              {nip19.npubEncode(user.pubkey)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert className="mb-8 border-primary/20 bg-primary/5">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription className="text-sm">
          This tool syncs profile metadata (kind 0), contact lists (kind 3), mute lists (kind 10000),
          pinned notes (kind 10001), relay lists (kind 10002), bookmarks (kind 10003), communities
          (kind 10004), search relays (kind 10007), interests (kind 10015), emoji lists (kind 10030),
          and DM relays (kind 10050) between relays.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Source Relay Section */}
        <div className="space-y-6">
          <RelayInput
            title="Source Relay"
            description="The relay to read your current profile data from"
            placeholder="wss://relay.damus.io"
            onRelayChange={handleSourceRelayChange}
            value={sourceRelay}
            isConnected={!!profileData}
            isLoading={isLoadingProfile}
          />

          {/* Profile Data Display */}
          {sourceRelay && (
            <>
              {profileError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Failed to load profile data: {profileError instanceof Error ? profileError.message : 'Unknown error'}
                  </AlertDescription>
                </Alert>
              )}

              {profileData && (
                <ProfileDataCard
                  profileData={profileData}
                  relayUrl={sourceRelay}
                  onSelectEvents={handleSelectEvents}
                  selectedEvents={selectedEvents}
                />
              )}
            </>
          )}
        </div>

        {/* Target Relay Section */}
        <div className="space-y-6">
          <RelayInput
            title="Target Relay"
            description="The relay to copy your profile data to"
            placeholder="wss://relay.nostr.band"
            onRelayChange={handleTargetRelayChange}
            value={targetRelay}
            isConnected={getConnectionState(targetRelay).isConnected}
            isLoading={getConnectionState(targetRelay).isLoading}
          />

          {/* Sync Controls */}
          <SyncButton
            sourceRelay={sourceRelay}
            targetRelay={targetRelay}
            selectedEvents={selectedEventsArray}
            onSync={handleSync}
            isLoading={isSyncing}
            syncResult={syncResult}
          />
        </div>
      </div>

      {/* Footer */}
      <Separator className="my-12" />
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Vibed with{' '}
          <a
            href="https://soapbox.pub/mkstack"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            MKStack
          </a>
        </p>
      </div>
    </div>
  );
}
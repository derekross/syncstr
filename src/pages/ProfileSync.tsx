import { useState, useEffect } from 'react';
import { nip19 } from 'nostr-tools';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useProfileData } from '@/hooks/useProfileData';
import { useSyncProfile } from '@/hooks/useSyncProfile';
import { useBackupMode } from '@/hooks/useBackupMode';
import { LoginArea } from '@/components/auth/LoginArea';
import { BackupControls } from '@/components/BackupControls';
import { RelayInput } from '@/components/RelayInput';
import { ProfileDataCard } from '@/components/ProfileDataCard';
import { SyncButton } from '@/components/SyncButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { RotateCcwIcon, UserIcon, InfoIcon, CheckCircleIcon, ZapIcon, ShieldIcon, GlobeIcon, FileIcon, RadioIcon } from 'lucide-react';
import type { NostrEvent } from '@nostrify/nostrify';

// Helper function to normalize relay URLs
const normalizeRelayUrl = (url: string): string => {
  if (!url) return url;
  
  const trimmed = url.trim();
  if (trimmed.startsWith('wss://') || trimmed.startsWith('ws://')) {
    return trimmed;
  }
  
  // Auto-add wss:// prefix for domain-like inputs
  if (trimmed.includes('.') && !trimmed.includes('://')) {
    return `wss://${trimmed}`;
  }
  
  return trimmed;
};

export function ProfileSync() {
  const { user } = useCurrentUser();
  const [sourceRelay, setSourceRelay] = useState('');
  const [targetRelay, setTargetRelay] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const { isBackupMode, backupData, backupSource, enterBackupMode, exitBackupMode } = useBackupMode();

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
    const normalizedRelay = normalizeRelayUrl(relay);
    setSourceRelay(normalizedRelay);
    // Trigger a refetch when the relay changes
    if (user?.pubkey) {
      refetchProfile();
    }
  };

  const handleSourceRelayDisconnect = () => {
    // Simple and effective: reload the page to reset all state
    window.location.reload();
  };

  // Target relay change handler is no longer needed since we use direct onChange

  // Use backup data if in backup mode, otherwise use profile data from relay
  const currentProfileData = isBackupMode ? backupData : profileData;
  const currentSource = isBackupMode ? backupSource : sourceRelay;

  const selectedEventsArray = currentProfileData
    ? Object.values(currentProfileData).filter(Boolean).filter(event => selectedEvents.has(event.id)) as NostrEvent[]
    : [];

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <RotateCcwIcon className="h-10 w-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              SyncStr
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Keep your Nostr profile <span className="font-semibold text-foreground">perfectly synchronized</span> across relays
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your profile data shouldn't be scattered. Sync your complete Nostr identity between relays with just a few clicks.
          </p>
        </div>

        {/* Problem & Solution Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* The Problem */}
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <GlobeIcon className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100">The Problem</h2>
              </div>
              <div className="space-y-3 text-orange-800 dark:text-orange-200">
                <p>Your Nostr profile data gets fragmented across relays because:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <span>Relays go offline or become unreliable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <span>Events don't always broadcast to every relay</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <span>Switching relays leaves some events behind</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <span>Some relays only have partial profile data</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* The Solution */}
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold text-green-900 dark:text-green-100">The Solution</h2>
              </div>
              <div className="space-y-3 text-green-800 dark:text-green-200">
                <p>SyncStr copies your complete profile between relays:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Profile info, contacts, bookmarks & more</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Test relay connections before syncing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Choose exactly what data to transfer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>You own your identity and your keys</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6">
            <ZapIcon className="h-12 w-12 mx-auto mb-4 text-purple-600" />
            <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              Sync your complete profile in seconds. Real-time progress tracking shows you exactly what's happening.
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <ShieldIcon className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-semibold mb-2">Private & Secure</h3>
            <p className="text-sm text-muted-foreground">
              You own your identity and control your keys. All signing happens locally in your browser.
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <GlobeIcon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Any Relay</h3>
            <p className="text-sm text-muted-foreground">
              Works with any Nostr relay. Popular options include Damus, Primal, Nostr.band, and many more.
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="max-w-2xl mx-auto text-center">
          <CardContent className="py-12 px-8">
            <UserIcon className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h3 className="text-2xl font-semibold mb-4">Ready to Sync Your Profile?</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Connect your Nostr account and start keeping your identity consistent across the decentralized network.
            </p>
            <div className="space-y-4">
              <LoginArea className="max-w-72 mx-auto" />
              <p className="text-xs text-muted-foreground">
                Supports browser extensions, private key login, and more
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            Supports all major profile data types: metadata, contacts, bookmarks, communities, interests & more
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ for the Nostr community • Open source & decentralized
          </p>
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
          {!isBackupMode ? (
            <RelayInput
              title="Source Relay"
              description="The relay to read your current profile data from (wss:// will be added automatically)"
              placeholder="i.e. relay.damus.io"
              onRelayChange={handleSourceRelayChange}
              value={sourceRelay}
              isConnected={!!profileData}
              isLoading={isLoadingProfile}
              onDisconnect={handleSourceRelayDisconnect}
            />
          ) : (
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileIcon className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                        Backup Mode Active
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Using data from: {backupSource}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={exitBackupMode}
                    variant="outline"
                    size="sm"
                    className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                  >
                    Use Relay Instead
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Backup Controls */}
          <BackupControls
            profileData={currentProfileData}
            pubkey={user.pubkey}
            onBackupRestore={enterBackupMode}
          />

          {/* Profile Data Display */}
          {currentSource && (
            <>
              {profileError && !isBackupMode && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Failed to load profile data: {profileError instanceof Error ? profileError.message : 'Unknown error'}
                  </AlertDescription>
                </Alert>
              )}

              {currentProfileData && (
                <ProfileDataCard
                  profileData={currentProfileData}
                  relayUrl={currentSource}
                  onSelectEvents={handleSelectEvents}
                  selectedEvents={selectedEvents}
                />
              )}
            </>
          )}
        </div>

        {/* Target Relay Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RadioIcon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Target Relay</CardTitle>
              </div>
              <CardDescription>The relay to copy your profile data to (wss:// will be added automatically)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="target-relay-input">Relay URL</Label>
                <Input
                  id="target-relay-input"
                  type="text"
                  placeholder="i.e. relay.nostr.band"
                  value={targetRelay}
                  onChange={(e) => setTargetRelay(e.target.value)}
                  onBlur={(e) => setTargetRelay(normalizeRelayUrl(e.target.value))}
                  className="w-full"
                />
                {targetRelay && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-mono break-all">{targetRelay}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sync Controls */}
          <SyncButton
            sourceRelay={currentSource}
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
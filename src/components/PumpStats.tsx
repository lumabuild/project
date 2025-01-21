"use client";

import { useEffect, useState } from 'react';
import TypewriterText from './TypewriterText';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

interface TokenEvent {
  signature?: string;
  mint?: string;
  traderPublicKey?: string;
  txType?: string;
  initialBuy?: number;
  solAmount?: number;
  bondingCurveKey?: string;
  vTokensInBondingCurve?: number;
  vSolInBondingCurve?: number;
  marketCapSol?: number;
  name?: string;
  symbol?: string;
  uri?: string;
  pool?: string;
}

interface TokenDetails {
  name: string;
  symbol: string;
  description: string | null;
  links?: {
    twitter?: string;
    website?: string;
  };
}

interface TrackTokenModalProps {
  token: TokenEvent;
  onClose: () => void;
}

async function fetchTokenDetails(mint: string): Promise<TokenDetails | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_SOLANA_TRACKER_API_KEY;
    if (!apiKey) {
      console.error('Missing API key');
      return null;
    }

    const response = await fetch(`https://data.solanatracker.io/tokens/${mint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-api-key': apiKey
      },
    });

    const data = await response.json();
    if (data.token) {
      return {
        name: data.token.name,
        symbol: data.token.symbol,
        description: data.token.description,
        links: {
          twitter: data.token.twitter,
          website: data.token.website,
        }
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching token details:', error);
    return null;
  }
}

function TrackTokenModal({ token, onClose }: TrackTokenModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
  const createAgentMutation = api.agent.create.useMutation();

  useEffect(() => {
    if (token.mint) {
      fetchTokenDetails(token.mint).then(details => {
        if (details) {
          setTokenDetails(details);
        }
      });
    }
  }, [token.mint]);

  const handleCreateAgent = async () => {
    if (!token.mint || isLoading) return;
    
    setIsLoading(true);
    try {

      const agent = await createAgentMutation.mutateAsync({
        name: tokenDetails?.name || token.name || 'Unnamed Token',
        token: token.mint,
      });

      // Redirect to the agent's chat page
      router.push(`/files/build/${agent.id}`);
    } catch (error) {
      console.error('Error creating agent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-terminal-black border border-terminal-lime p-4 max-w-md w-full">
          <h3 className="text-terminal-lime mb-4">Please sign in to track tokens</h3>
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="text-terminal-lime border border-terminal-lime px-4 py-2 hover:bg-terminal-lime/20"
            >
              Close
            </button>
            <button
              onClick={() => signIn('google')}
              className="text-terminal-lime border border-terminal-lime px-4 py-2 hover:bg-terminal-lime/20"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-terminal-black border border-terminal-lime p-4 max-w-md w-full">
        <h3 className="text-terminal-lime mb-4">Create Agent for Token</h3>
        <div className="mb-4 space-y-2">
          <div>
            <span className="text-terminal-lime/70">Name: </span>
            <span className="text-terminal-lime">{tokenDetails?.name || token.name || 'Unnamed Token'}</span>
          </div>
          <div>
            <span className="text-terminal-lime/70">Symbol: </span>
            <span className="text-terminal-lime">{tokenDetails?.symbol || token.symbol || 'N/A'}</span>
          </div>
          {tokenDetails?.description && (
            <div>
              <span className="text-terminal-lime/70">Description: </span>
              <span className="text-terminal-lime">{tokenDetails.description}</span>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="text-terminal-lime border border-terminal-lime px-4 py-2 hover:bg-terminal-lime/20"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateAgent}
            disabled={isLoading}
            className="text-terminal-lime border border-terminal-lime px-4 py-2 hover:bg-terminal-lime/20 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Agent'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PumpStats() {
  const [displayedEvents, setDisplayedEvents] = useState<TokenEvent[]>([]);
  const [latestEvents, setLatestEvents] = useState<TokenEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenEvent | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connect = () => {
      if (eventSource) {
        eventSource.close();
      }

      eventSource = new EventSource('/api/pump-stats');
      setIsConnected(true);

      eventSource.onmessage = (event) => {
        try {
          const rawData = JSON.parse(event.data);
          if (rawData && typeof rawData === 'object') {
            setLatestEvents((prev) => [rawData, ...prev].slice(0, 5));
            
            if (!isPaused) {
              setDisplayedEvents((prev) => [rawData, ...prev].slice(0, 5));
            }
          }
        } catch (error) {
          console.error('Error parsing event data:', error);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        eventSource?.close();
        setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
        setIsConnected(false);
      }
    };
  }, [isPaused]);

  useEffect(() => {
    if (!isPaused) {
      setDisplayedEvents(latestEvents);
    }
  }, [isPaused, latestEvents]);

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return 'N/A';
    return typeof num === 'number' ? num.toLocaleString() : 'N/A';
  };

  const formatSol = (num: number | undefined | null) => {
    if (num === undefined || num === null) return 'N/A';
    return typeof num === 'number' ? num.toFixed(2) : 'N/A';
  };

  return (
    <div className="space-y-2 font-mono text-terminal-lime">
      <div className="flex items-center justify-between border-b border-terminal-lime/30 pb-2">
        <div className="flex items-center space-x-2">
          <span className="text-terminal-lime">$</span>
          <TypewriterText text="MONITORING PUMP.FUN NETWORK" />
        </div>
        <div className="flex items-center space-x-4 text-xs">
          {isPaused && (
            <span className="text-terminal-lime/70">PAUSED</span>
          )}
          <div>
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-terminal-lime' : 'bg-red-500'}`} />
            <span className="text-terminal-lime/70">{isConnected ? 'CONNECTED' : 'RECONNECTING...'}</span>
          </div>
        </div>
      </div>
      
      <div 
        className="space-y-2 mt-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="popLayout">
          {displayedEvents.length === 0 ? (
            <div className="text-terminal-lime/50 text-sm">
              &gt; Waiting for new token creations...
            </div>
          ) : (
            displayedEvents.map((event, index) => (
              <motion.div
                key={event?.signature || index}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                layout
                className="border border-terminal-lime/20 bg-terminal-black/50 p-3 cursor-pointer hover:border-terminal-lime/50"
                onClick={() => setSelectedToken(event)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-terminal-lime/70">&gt;</span>
                      <span className="text-terminal-lime">
                        {event?.name || 'UNNAMED'} [{event?.symbol || 'N/A'}]
                      </span>
                    </div>
                    <div className="text-sm text-terminal-lime/70 mt-1">
                      TYPE: {event?.txType?.toUpperCase() || 'N/A'}
                    </div>
                  </div>
                  <div className="text-right text-terminal-lime/90">
                    <div>{formatSol(event?.solAmount)} SOL</div>
                    <div className="text-xs text-terminal-lime/50">
                      MC: {formatSol(event?.marketCapSol)} SOL
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-terminal-lime/70">
                  <div>
                    <span className="opacity-50">INITIAL_BUY=</span>
                    <span>{formatNumber(event?.initialBuy)}</span>
                  </div>
                  <div>
                    <span className="opacity-50">POOL=</span>
                    <span>{(event?.pool || 'N/A').toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-terminal-lime/40 truncate">
                  MINT: {event?.mint || 'N/A'}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {selectedToken && (
        <TrackTokenModal
          token={selectedToken}
          onClose={() => setSelectedToken(null)}
        />
      )}
    </div>
  );
} 
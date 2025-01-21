"use client";

import { useState, useEffect } from "react";
import TypewriterText from "../../../components/TypewriterText";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

interface Pool {
  poolId: string;
  price: {
    quote: number | null;
    usd: number | null;
  };
  marketCap: {
    quote: number;
    usd: number;
  };
  tokenSupply: number;
}

async function fetchTokenDetails(mint: string) {
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
        },
        marketCapSol: data.pools[0]?.marketCap.quote || 0,
        totalSupply: data.pools[0]?.tokenSupply.toString(),
        holdersCount: "N/A", // Not available in new API
        liquidityPools: (data.pools as Pool[]).reduce((acc: Record<string, any>, pool: Pool) => {
          if (pool.price.quote) {
            acc[pool.poolId] = {
              protocolData: {
                price0: pool.price.quote.toString(),
              }
            };
          }
          return acc;
        }, {})
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching token details:', error);
    return null;
  }
}

export default function BuildAgentPage() {
  const [agentName, setAgentName] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const getAgentQuery = api.agent.get.useQuery(undefined, {
    enabled: !!session
  });
  const { data: agentsData, isLoading: isAgentsLoading } = getAgentQuery;
  const createAgentMutation = api.agent.create.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: async () => {
      await getAgentQuery.refetch();
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });

  const handleCreateAgent = async () => {
    if (!session) {
      localStorage.setItem('pendingAgent', JSON.stringify({ agentName, tokenAddress }));
      await signIn('google');
      return;
    }

    setLoading(true);
    try {

      await createAgentMutation.mutateAsync({
        name: agentName,
        token: tokenAddress,
        tokenDetails: await fetchTokenDetails(tokenAddress)
      });
      setAgentName("");
      setTokenAddress("");
    } catch (error) {
      console.error('Error creating agent:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      const pendingAgent = localStorage.getItem('pendingAgent');
      if (pendingAgent) {
        const { agentName: savedName, tokenAddress: savedToken } = JSON.parse(pendingAgent);
        setAgentName(savedName);
        setTokenAddress(savedToken);
        localStorage.removeItem('pendingAgent');
      }
    }
  }, [session]);

  const buttonText = loading 
    ? 'Creating...' 
    : (!session ? 'Sign in to Create Agent' : 'Create Agent');

  return (
    <div className="min-h-screen bg-terminal-black p-4">
      <div className="h-full">
        <Button 
          onClick={() => router.push('/')}
          className="mb-4 bg-terminal-darkgray border border-terminal-lime text-terminal-lime px-4 py-2 hover:bg-terminal-lime/20 transition-colors"
        >
          &lt; Back to Terminal
        </Button>
        <div className="border border-terminal-lime p-4">
          <TypewriterText text="=== BUILD AGENT INTERFACE ===" />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-terminal-lime p-4">
              <TypewriterText text="Agent Configuration" />
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-terminal-lime mb-2">Agent Name</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full bg-terminal-darkgray border border-terminal-lime text-terminal-lime p-2 focus:outline-none focus:ring-0"
                  />
                </div>
                <div>
                  <label className="block text-terminal-lime mb-2">Token Address</label>
                  <input
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    placeholder="Enter token mint address"
                    className="w-full bg-terminal-darkgray border border-terminal-lime text-terminal-lime p-2 focus:outline-none focus:ring-0 placeholder:text-terminal-lime/50 font-mono"
                  />
                </div>
                <Button 
                  className="bg-terminal-darkgray border border-terminal-lime text-terminal-lime px-4 py-2 hover:bg-terminal-lime/20 transition-colors w-full"
                  onClick={handleCreateAgent}
                  disabled={loading}
                >
                  {buttonText}
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="border border-terminal-lime p-4">
                <TypewriterText text="Agent Preview" />
                <div className="mt-4">
                  <pre className="text-terminal-lime whitespace-pre-wrap text-sm">
                    {JSON.stringify({ name: agentName, tokenAddress }, null, 2)}
                  </pre>
                </div>
              </div>
              {session && (
                <div className="border border-terminal-lime p-4">
                  <TypewriterText text="Created Agents" />
                  <div className="mt-4 h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-terminal-lime/30 scrollbar-track-terminal-black">
                    {isAgentsLoading ? (
                      <p className="text-terminal-lime mt-4">&gt; Loading agents...</p>
                    ) : agentsData?.length === 0 ? (
                      <p className="text-terminal-lime mt-4">&gt; No agents created yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {agentsData?.map((agent) => (
                          <div
                            key={agent.id}
                            onClick={() => router.push(`/files/build/${agent.id}`)}
                            className="border border-terminal-lime/30 p-3 cursor-pointer hover:border-terminal-lime/60"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-terminal-lime font-bold">{agent.name}</h3>
                                <p className="text-terminal-lime/70 text-sm mt-1">
                                  Created: {new Date(agent.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-terminal-lime/50 text-sm">
                                <p>{agent.trackedTokens?.length || 0} tokens</p>
                                <p>{agent.trackedWallets?.length || 0} wallets</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
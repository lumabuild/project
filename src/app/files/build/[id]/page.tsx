"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import TypewriterText from "@/components/TypewriterText";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface TokenResponse {
  token: {
    name: string;
    symbol: string;
    mint: string;
    uri: string;
    decimals: number;
    hasFileMetaData: boolean;
    createdOn: string;
    description: string;
    image: string;
    showName: boolean;
    twitter?: string;
    website?: string;
  };
  pools: Array<{
    poolId: string;
    liquidity: {
      quote: number;
      usd: number;
    };
    price: {
      quote: number | null;
      usd: number | null;
    };
    tokenSupply: number;
    marketCap: {
      quote: number;
      usd: number;
    };
    txns?: {
      buys: number;
      sells: number;
      total: number;
      volume: number;
    };
  }>;
  events: {
    "1h": { priceChangePercentage: number };
    "24h": { priceChangePercentage: number };
  };
  risk: {
    rugged: boolean;
    risks: Array<{
      name: string;
      description: string;
      level: "warning" | "danger";
      score: number;
      value?: string;
    }>;
    score: number;
  };
}

interface TokenDetails {
  name: string;
  symbol: string;
  description: string | null;
  links: {
    twitter?: string;
    website?: string;
  };
  marketCapSol: number;
  totalSupply: string;
  holdersCount: string;
  liquidityPools: Record<string, {
    protocolData: {
      price0: string;
    };
  }>;
  priceChange: {
    "1h": number;
    "24h": number;
  };
  risk: {
    rugged: boolean;
    risks: Array<{
      name: string;
      description: string;
      level: "warning" | "danger";
      score: number;
      value?: string;
    }>;
    score: number;
  };
  txns?: {
    buys: number;
    sells: number;
    total: number;
    volume: number;
  };
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

    const data = await response.json() as TokenResponse;
    console.log("data", data);
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
        totalSupply: data.pools[0]?.tokenSupply.toString() || "N/A",
        holdersCount: "N/A", // Not available in new API
        liquidityPools: data.pools.reduce((acc: Record<string, any>, pool) => {
          if (pool.price.quote) {
            acc[pool.poolId] = {
              protocolData: {
                price0: pool.price.quote.toString(),
              }
            };
          }
          return acc;
        }, {}),
        priceChange: {
          "1h": data.events["1h"].priceChangePercentage,
          "24h": data.events["24h"].priceChangePercentage
        },
        risk: data.risk,
        txns: data.pools[0]?.txns
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching token details:', error);
    return null;
  }
}

export default function AgentChatPage() {
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: agent, isLoading: isLoadingAgent } = api.agent.getById.useQuery({ 
    id: params.id as string 
  });
  const createMessageMutation = api.agent.createMessage.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const updateTokenDetails = async (mint: string) => {
    console.log('Updating token details for mint:', mint);
    setIsLoadingDetails(true);
    try {
      const details = await fetchTokenDetails(mint);
      console.log('Fetched details:', details);
      if (details) {
        setTokenDetails(details);
      }
    } catch (error) {
      console.error('Error updating token details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Initial load of token details
  useEffect(() => {
    console.log('Effect triggered:', {
      isLoadingAgent,
      agentData: agent,
      trackedTokens: agent?.trackedTokens,
      mint: agent?.trackedTokens?.[0]?.mint
    });
    
    if (!isLoadingAgent && agent?.trackedTokens?.[0]?.mint) {
      console.log('Loading initial data for mint:', agent.trackedTokens[0].mint);
      void updateTokenDetails(agent.trackedTokens[0].mint);
    }
  }, [isLoadingAgent, agent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !agent) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Update token details before sending message
      if (agent.trackedTokens?.[0]?.mint) {
        await updateTokenDetails(agent.trackedTokens[0].mint);
      }

      const response = await createMessageMutation.mutateAsync({
        agentId: agent.id,
        latestInfo: tokenDetails ? JSON.stringify(tokenDetails) : undefined,
        content: input,
      });

      setMessages(prev => [...prev, { role: "assistant", content: response.content }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error processing your message." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatNumber = (num: string | undefined) => {
    if (!num) return 'N/A';
    return parseInt(num).toLocaleString();
  };

  const formatPrice = (price: string | undefined) => {
    if (!price || price === 'NaN') return 'N/A';
    return parseFloat(price).toFixed(6);
  };

  return (
    <div className="h-screen bg-terminal-black flex">
      {/* Token Stats Sidebar */}
      <div className="w-80 border-r border-terminal-lime p-4 overflow-y-auto font-mono">
        <h2 className="text-terminal-lime text-lg mb-4 border-b border-terminal-lime pb-2">
          Token Stats {isLoadingDetails && <span className="text-terminal-lime/50">(updating...)</span>}
        </h2>
        {isLoadingAgent ? (
          <div className="text-terminal-lime/50">Loading agent...</div>
        ) : !agent?.trackedTokens?.length ? (
          <div className="text-terminal-lime/50">No tokens tracked</div>
        ) : !tokenDetails ? (
          <div className="text-terminal-lime/50">Loading token details...</div>
        ) : (
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-terminal-lime/70 mb-1">Name</div>
              <div className="text-terminal-lime">{tokenDetails?.name || 'N/A'}</div>
            </div>
            <div>
              <div className="text-terminal-lime/70 mb-1">Symbol</div>
              <div className="text-terminal-lime">{tokenDetails?.symbol || 'N/A'}</div>
            </div>
            <div>
              <div className="text-terminal-lime/70 mb-1">Total Supply</div>
              <div className="text-terminal-lime">{formatNumber(tokenDetails?.totalSupply) || 'N/A'}</div>
            </div>
            <div>
              <div className="text-terminal-lime/70 mb-1">Market Cap (SOL)</div>
              <div className="text-terminal-lime">{tokenDetails?.marketCapSol?.toFixed(2) || 'N/A'}</div>
            </div>
            <div>
              <div className="text-terminal-lime/70 mb-1">Price</div>
              <div className="text-terminal-lime">
                {Object.values(tokenDetails?.liquidityPools || {}).map(pool => 
                  formatPrice(pool.protocolData?.price0)
                )[0] || 'N/A'} SOL
              </div>
            </div>
            <div>
              <div className="text-terminal-lime/70 mb-1">Price Change</div>
              <div className="flex justify-between">
                <div>
                  <span className="text-terminal-lime/70">1h: </span>
                  <span className={`${tokenDetails.priceChange["1h"] >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tokenDetails.priceChange["1h"].toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-terminal-lime/70">24h: </span>
                  <span className={`${tokenDetails.priceChange["24h"] >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tokenDetails.priceChange["24h"].toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            {tokenDetails.txns && (
              <div className="pt-4 border-t border-terminal-lime/30">
                <div className="text-terminal-lime/70 mb-2">Trading Activity</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-terminal-lime/50 text-xs">Buys</div>
                    <div className="text-terminal-lime">{tokenDetails.txns.buys}</div>
                  </div>
                  <div>
                    <div className="text-terminal-lime/50 text-xs">Sells</div>
                    <div className="text-terminal-lime">{tokenDetails.txns.sells}</div>
                  </div>
                  <div>
                    <div className="text-terminal-lime/50 text-xs">Total Txns</div>
                    <div className="text-terminal-lime">{tokenDetails.txns.total}</div>
                  </div>
                  <div>
                    <div className="text-terminal-lime/50 text-xs">Volume</div>
                    <div className="text-terminal-lime">{tokenDetails.txns.volume}</div>
                  </div>
                </div>
              </div>
            )}
            {tokenDetails.risk && (
              <div className="pt-4 border-t border-terminal-lime/30">
                <div className="text-terminal-lime/70 mb-2">Risk Analysis</div>
                <div className="space-y-2">
                  {tokenDetails.risk.rugged && (
                    <div className="text-red-400 font-bold">⚠️ RUGGED</div>
                  )}
                  <div>
                    <div className="text-terminal-lime/50 text-xs">Risk Score</div>
                    <div className={`text-terminal-lime ${tokenDetails.risk.score > 3 ? 'text-red-400' : 'text-green-400'}`}>
                      {tokenDetails.risk.score}/10
                    </div>
                  </div>
                  {tokenDetails.risk.risks.map((risk, index) => (
                    <div key={index} className={`text-xs ${risk.level === 'danger' ? 'text-red-400' : 'text-yellow-400'}`}>
                      • {risk.name} {risk.value ? `(${risk.value})` : ''}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tokenDetails?.links && Object.keys(tokenDetails.links).length > 0 && (
              <div className="pt-4 border-t border-terminal-lime/30">
                {tokenDetails.links.website && (
                  <a
                    href={tokenDetails.links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-terminal-lime hover:text-terminal-lime/70 block mb-2"
                  >
                    Website ↗
                  </a>
                )}
                {tokenDetails.links.twitter && (
                  <a
                    href={tokenDetails.links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-terminal-lime hover:text-terminal-lime/70 block"
                  >
                    Twitter ↗
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-terminal-lime p-4">
          <div className="flex items-center">
            <button
              onClick={() => window.history.back()}
              className="mr-4 bg-terminal-darkgray border border-terminal-lime text-terminal-lime px-4 py-2 hover:bg-terminal-lime/20 transition-colors font-mono"
            >
              &lt; Back
            </button>
            <div className="flex justify-between items-center flex-1">
              <div className="text-terminal-lime font-mono">
                {isLoadingAgent ? (
                  "=== AGENT: Loading... ==="
                ) : (
                  `=== AGENT: ${agent?.name || 'Unknown'} ===`
                )}
              </div>
              <div className="text-terminal-lime/70 text-sm font-mono">
                <p>{agent?.trackedTokens?.length || 0} tokens tracked</p>
                <p>{agent?.trackedWallets?.length || 0} wallets tracked</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div
                  className={`max-w-[80%] p-3 border font-mono ${
                    message.role === 'user'
                      ? 'border-terminal-lime/50 bg-terminal-lime/10'
                      : 'border-terminal-lime/30'
                  }`}
                >
                  <div className="text-terminal-lime/50 text-xs mb-1">
                    {message.role === 'user' ? 'YOU' : agent?.name}
                  </div>
                  <div className="text-terminal-lime whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-terminal-lime/50 font-mono"
              >
                {agent?.name} is typing...
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-terminal-lime p-4">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter command..."
                className="flex-1 bg-terminal-black border border-terminal-lime text-terminal-lime p-2 focus:outline-none focus:ring-0 font-mono placeholder-terminal-lime/30"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="border border-terminal-lime px-4 py-2 text-terminal-lime hover:bg-terminal-lime/20 disabled:opacity-50 font-mono"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
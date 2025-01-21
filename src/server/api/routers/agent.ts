import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { env } from "@/env";
import { Groq } from "groq-sdk";

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
  }>;
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
}

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});

async function fetchTokenDetails(mint: string): Promise<TokenDetails | null> {
  try {
    const response = await fetch(`https://data.solanatracker.io/tokens/${mint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-api-key': env.SOLANA_TRACKER_API_KEY,
      },
    });

    const data = await response.json() as TokenResponse;
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
        }, {})
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching token details:', error);
    return null;
  }
}

export const agentRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.agent.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        trackedTokens: true,
        trackedWallets: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.agent.findUnique({
        where: { id: input.id },
        include: {
          trackedTokens: true,
          trackedWallets: true,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        token: z.string(),
        tokenDetails: z.any()
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tokenDetails = input.tokenDetails;      
      const systemPrompt = `You are an AI agent called ${input.name} specialized in tracking and analyzing the ${tokenDetails?.name || input.name || 'token'} (${tokenDetails?.symbol || 'N/A'}) on the Solana blockchain.
      
      Token Details:
      - Name: ${tokenDetails?.name || input.name}
      - Symbol: ${tokenDetails?.symbol || 'N/A'}
      - Description: ${tokenDetails?.description || 'N/A'}
      ${tokenDetails?.links?.website ? `- Website: ${tokenDetails.links.website}` : ''}
      ${tokenDetails?.links?.twitter ? `- Twitter: ${tokenDetails.links.twitter}` : ''}
    
      
      Assume you have live information about the token at all times. The latest information of the token is below. Keep our responses short and concrete.`;

      return ctx.db.agent.create({
        data: {
          name: tokenDetails?.name || input.name,
          systemPrompt: systemPrompt,
          userId: ctx.session.user.id,
          trackedTokens: {
            create: {
              mint: input.token,
              name: tokenDetails?.name,
              symbol: tokenDetails?.symbol,
            },
          },
        },
      });
    }),

  trackToken: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        mint: z.string(),
        name: z.string().optional(),
        symbol: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.trackedToken.create({
        data: {
          mint: input.mint,
          name: input.name,
          symbol: input.symbol,
          agentId: input.agentId,
        },
      });
    }),

  createMessage: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        latestInfo: z.string().optional(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the agent and its tracked data
      const agent = await ctx.db.agent.findUnique({
        where: { id: input.agentId },
        include: {
          trackedTokens: true,
          trackedWallets: true,
        },
      });

      if (!agent) {
        throw new Error("Agent not found");
      }

      // Save user message
      await ctx.db.message.create({
        data: {
          content: input.content,
          role: "user",
          agentId: input.agentId,
        },
      });

      // Create context for the AI
      const context = `${agent.systemPrompt}
      
      ${input.latestInfo ? `Latest information: ${input.latestInfo}` : ''}
      `;

      // Get AI response
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: context },
          { role: "user", content: input.content },
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0.7,
        max_tokens: 1024,
      });

      const response = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";

      // Save AI response
      const message = await ctx.db.message.create({
        data: {
          content: response,
          role: "assistant",
          agentId: input.agentId,
        },
      });

      return message;
    }),
});

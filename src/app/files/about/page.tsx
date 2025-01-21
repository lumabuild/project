import TypewriterText from "../../../components/TypewriterText";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-terminal-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className="border border-terminal-lime p-4 space-y-6">
          <TypewriterText text="[ LUMABUILDS - AI-Powered Solana Memecoin Analytics Platform ]" />
          
          <div className="mt-6">
            <TypewriterText 
              text=">> System Overview"
              className="text-terminal-lime font-bold mb-2"
            />
            <TypewriterText 
              text="Lumabuilds is an advanced AI-driven platform designed to revolutionize memecoin trading and analysis on the Solana blockchain. Our system combines real-time market data, artificial intelligence, and natural language processing to provide unprecedented insights into memecoin movements and market sentiment."
              delay={20}
            />
          </div>

          <div className="mt-4">
            <TypewriterText 
              text=">> Key Features"
              className="text-terminal-lime font-bold mb-2"
            />
            <ul className="list-none space-y-2">
              <li><TypewriterText text="• Real-time memecoin tracking and analysis" delay={30} /></li>
              <li><TypewriterText text="• AI-powered chat interface for coin-specific insights" delay={30} /></li>
              <li><TypewriterText text="• Live market sentiment analysis" delay={30} /></li>
              <li><TypewriterText text="• Contract address (CA) tracking and verification" delay={30} /></li>
              <li><TypewriterText text="• Automated social media sentiment analysis (Coming Soon)" delay={30} /></li>
              <li><TypewriterText text="• Cross-platform verification system" delay={30} /></li>
            </ul>
          </div>

          <div className="mt-4">
            <TypewriterText 
              text=">> Technology Stack"
              className="text-terminal-lime font-bold mb-2"
            />
            <TypewriterText 
              text="Built on cutting-edge technology, Lumabuilds leverages TypeScript, Next.js, tRPC, FastAPI, and Python for its core infrastructure. Our system processes millions of data points per second using Groq's advanced language models and PostgreSQL for reliable data storage, providing you with the most relevant information about any memecoin on the Solana blockchain."
              delay={20}
            />
          </div>

          <div className="mt-4">
            <TypewriterText 
              text=">> Mission Statement"
              className="text-terminal-lime font-bold mb-2"
            />
            <TypewriterText 
              text="Our mission is to bring transparency and intelligence to the memecoin ecosystem, enabling traders and enthusiasts to make informed decisions based on real-time data and AI-driven insights."
              delay={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 
import TypewriterText from "../../../components/TypewriterText";

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-terminal-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className="border border-terminal-lime p-4 space-y-6">
          <TypewriterText 
            text="LUMABUILDS TECHNICAL WHITEPAPER v1.0"
            className="text-xl font-bold"
          />

          <div className="mt-6">
            <TypewriterText 
              text="1. EXECUTIVE SUMMARY"
              className="text-terminal-lime font-bold mb-2"
            />
            <TypewriterText 
              text="Lumabuilds represents a paradigm shift in memecoin analysis and trading on the Solana blockchain. By leveraging advanced artificial intelligence, machine learning, and real-time data processing, Lumabuilds provides unprecedented insights into memecoin market dynamics and social sentiment analysis."
              delay={20}
            />
          </div>

          <div className="mt-4">
            <TypewriterText 
              text="2. SYSTEM ARCHITECTURE"
              className="text-terminal-lime font-bold mb-2"
            />
            <TypewriterText 
              text="2.1 Core Components:"
              className="text-terminal-lime mb-2"
            />
            <ul className="list-none space-y-2 ml-4">
              <li><TypewriterText text="• Backend: FastAPI-powered Python server with tRPC integration" delay={30} /></li>
              <li><TypewriterText text="• AI Engine: Groq-powered language models for real-time analysis" delay={30} /></li>
              <li><TypewriterText text="• Frontend: Next.js with TypeScript for type-safe development" delay={30} /></li>
              <li><TypewriterText text="• Database: PostgreSQL for reliable data persistence" delay={30} /></li>
            </ul>
          </div>

          <div className="mt-4">
            <TypewriterText 
              text="3. AI IMPLEMENTATION"
              className="text-terminal-lime font-bold mb-2"
            />
            <TypewriterText 
              text="3.1 Natural Language Processing:"
              className="text-terminal-lime mb-2"
            />
            <TypewriterText 
              text="Our system employs Groq's state-of-the-art language models for:"
              delay={20}
            />
            <ul className="list-none space-y-2 ml-4">
              <li><TypewriterText text="• Sentiment Analysis: Real-time market sentiment tracking" delay={30} /></li>
              <li><TypewriterText text="• Entity Recognition: Identifying relevant market actors and events" delay={30} /></li>
              <li><TypewriterText text="• Pattern Recognition: Detecting market manipulation attempts" delay={30} /></li>
            </ul>
          </div>

          <div className="mt-4">
            <TypewriterText 
              text="4. DATA PROCESSING PIPELINE"
              className="text-terminal-lime font-bold mb-2"
            />
            <TypewriterText 
              text="4.1 Real-time Processing:"
              className="text-terminal-lime mb-2"
            />
            <TypewriterText 
              text="• API Layer: FastAPI for high-performance endpoints\n• Type Safety: End-to-end type safety with TypeScript and tRPC\n• Storage Layer: PostgreSQL with optimized indexing\n• Analysis Layer: Python-based ML models with Groq integration"
              delay={20}
            />
          </div>

          <div className="mt-4">
            <TypewriterText 
              text="5. SECURITY MEASURES"
              className="text-terminal-lime font-bold mb-2"
            />
            <TypewriterText 
              text="5.1 Smart Contract Analysis:"
              className="text-terminal-lime mb-2"
            />
            <TypewriterText 
              text="• Automated vulnerability scanning\n• Bytecode analysis\n• Transaction pattern analysis\n• Rugpull detection algorithms"
              delay={20}
            />
          </div>

          <div className="mt-4">
            <TypewriterText 
              text="6. FUTURE DEVELOPMENTS"
              className="text-terminal-lime font-bold mb-2"
            />
            <ul className="list-none space-y-2">
              <li><TypewriterText text="• Advanced social media integration and verification" delay={30} /></li>
              <li><TypewriterText text="• Enhanced AI models for market prediction" delay={30} /></li>
              <li><TypewriterText text="• Cross-chain analysis capabilities" delay={30} /></li>
              <li><TypewriterText text="• Automated trading strategy suggestions" delay={30} /></li>
            </ul>
          </div>

          <div className="mt-4">
            <TypewriterText 
              text="7. TECHNICAL SPECIFICATIONS"
              className="text-terminal-lime font-bold mb-2"
            />
            <TypewriterText 
              text="• Backend: FastAPI (Python)\n• Frontend: Next.js, TypeScript\n• API Layer: tRPC\n• Database: PostgreSQL\n• AI Models: Groq LLMs\n• Type Safety: End-to-end TypeScript"
              delay={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 
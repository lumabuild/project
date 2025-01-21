"use client";
import AsciiHeader from "./AsciiHeader";
import TypewriterText from "./TypewriterText";
import FileList from "./FileList";
import { PumpStats } from "./PumpStats";
import { DashboardStats } from "./DashboardStats";
import { signOut } from "next-auth/react";

const TerminalLayout = () => {
  return (
    <div className="min-h-screen bg-terminal-black p-2 flex items-center justify-center">
      <div className="w-[800px] max-w-[98vw] my-8">
        <AsciiHeader />
        <div className="mt-8">
          <DashboardStats />
        </div>
        <div className="mt-8 border-t border-b border-terminal-lime py-4">
          <TypewriterText text="=== LUMABUILD - SYSTEM INTERFACE ===" />
        </div>
        <div className="mt-8">
          <FileList />
        </div>
        <div className="mt-8 border-t border-terminal-lime/30 pt-4">
          <PumpStats />
        </div>
        <div className="mt-8 text-sm opacity-70">
          <TypewriterText text="Powered by LumaBuild Technologies" />
        </div>
        <div>
          <button 
            onClick={() => signOut()}
            className="underline"
          >
            <TypewriterText text="Sign Out" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerminalLayout;
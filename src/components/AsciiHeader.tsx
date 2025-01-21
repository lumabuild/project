"use client";

const AsciiHeader = () => {
  return (
    <div className="w-full overflow-hidden">
      <pre className="ascii-art text-terminal-lime text-[0.6rem] sm:text-xs md:text-sm whitespace-pre font-mono">
        {`
██╗     ██╗   ██╗███╗   ███╗ █████╗ ██████╗ ██╗   ██╗██╗██╗     ██████╗ 
██║     ██║   ██║████╗ ████║██╔══██╗██╔══██╗██║   ██║██║██║     ██╔══██╗
██║     ██║   ██║██╔████╔██║███████║██████╔╝██║   ██║██║██║     ██║  ██║
██║     ██║   ██║██║╚██╔╝██║██╔══██║██╔══██╗██║   ██║██║██║     ██║  ██║
███████╗╚██████╔╝██║ ╚═╝ ██║██║  ██║██████╔╝╚██████╔╝██║███████╗██████╔╝
╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝ 
        `}
      </pre>
    </div>
  );
};

export default AsciiHeader;
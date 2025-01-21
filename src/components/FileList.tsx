import TypewriterText from "./TypewriterText";
import Link from "next/link";

const FileList = () => {
  const files = [
    { name: "ABOUT.TXT", path: "/files/about" },
    { name: "BUILD.AGENT (WORK IN PROGRESS)", path: "/files/build" },
    { name: "WHITEPAPER.TXT", path: "/files/whitepaper" },
  ];

  return (
    <div className="text-left p-4 border border-terminal-lime w-full max-w-full overflow-hidden">
      <div className="mb-4">
        <TypewriterText text="=== SYSTEM FILES ===" />
      </div>
      <div className="space-y-0">
        {files.map((file, index) => (
          <div key={index} className="block">
            <Link href={file.path}>
              <button className="text-terminal-lime hover:bg-terminal-green hover:bg-opacity-20 w-full text-left px-2 py-1 transition-colors">
                <TypewriterText text={`> ${file.name}`} delay={20} />
              </button>
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-6 border-t border-terminal-lime pt-4">
        <TypewriterText text="CA: To Be Announced" delay={20} />
      </div>
    </div>
  );
};

export default FileList;
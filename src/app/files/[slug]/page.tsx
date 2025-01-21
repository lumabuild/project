"use client";
import { useParams } from "react-router-dom";
import TypewriterText from "../../../components/TypewriterText";

export default function FilePage() {
  const params = useParams();
  const slug = params.slug;

  return (
    <div className="min-h-screen bg-terminal-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className="border border-terminal-lime p-4">
          <TypewriterText text={`Accessing file: ${slug}`} />
          <div className="mt-4">
            <TypewriterText text="Content to be implemented..." delay={1000} />
          </div>
        </div>
      </div>
    </div>
  );
}
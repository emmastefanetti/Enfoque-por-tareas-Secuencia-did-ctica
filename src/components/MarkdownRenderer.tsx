import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Split by double line breaks first to get block chunks
  const paragraphs = content.split(/\n\n+/);

  const parseInlineStyles = (text: string): React.ReactNode[] => {
    // Basic regex parser for bold **text** and code \`text\`
    const tokens: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Find next bold or code matches
      const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
      const codeMatch = remaining.match(/`(.*?)`/);

      // Determine which occurs first
      let boldIdx = boldMatch && boldMatch.index !== undefined ? boldMatch.index : -1;
      let codeIdx = codeMatch && codeMatch.index !== undefined ? codeMatch.index : -1;

      if (boldIdx === -1 && codeIdx === -1) {
        tokens.push(<span key={`text-${keyIdx++}`}>{remaining}</span>);
        break;
      }

      // Check if bold is first or only matching
      if (boldIdx !== -1 && (codeIdx === -1 || boldIdx < codeIdx)) {
        // Text before the match
        if (boldIdx > 0) {
          tokens.push(<span key={`text-${keyIdx++}`}>{remaining.slice(0, boldIdx)}</span>);
        }
        tokens.push(
          <strong key={`bold-${keyIdx++}`} className="font-semibold text-neutral-900 bg-neutral-100/50 px-1 rounded">
            {boldMatch![1]}
          </strong>
        );
        remaining = remaining.slice(boldIdx + boldMatch![0].length);
      } else {
        // Code is first or only matching
        if (codeIdx > 0) {
          tokens.push(<span key={`text-${keyIdx++}`}>{remaining.slice(0, codeIdx)}</span>);
        }
        tokens.push(
          <code key={`code-${keyIdx++}`} className="font-mono text-xs text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
            {codeMatch![1]}
          </code>
        );
        remaining = remaining.slice(codeIdx + codeMatch![0].length);
      }
    }

    return tokens;
  };

  return (
    <div className="space-y-4 text-sm text-neutral-700 leading-relaxed font-sans">
      {paragraphs.map((para, paraIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Header 3: "### Title"
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={`h3-${paraIdx}`} className="text-base font-semibold text-neutral-900 mt-6 mb-2 tracking-tight flex items-center border-l-3 border-indigo-600 pl-2">
              {parseInlineStyles(trimmed.slice(4))}
            </h3>
          );
        }

        // Header 4: "#### Title"
        if (trimmed.startsWith("#### ")) {
          return (
            <h4 key={`h4-${paraIdx}`} className="text-sm font-semibold text-neutral-800 mt-4 mb-2 tracking-tight">
              {parseInlineStyles(trimmed.slice(5))}
            </h4>
          );
        }

        // Bullet list block: Lines starting with "- " or "* "
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.includes("\n- ") || trimmed.includes("\n* ")) {
          const lines = trimmed.split("\n");
          return (
            <ul key={`ul-${paraIdx}`} className="space-y-2 my-2 pl-5 list-disc marker:text-indigo-400">
              {lines.map((line, lineIdx) => {
                const cleanLine = line.replace(/^[-*]\s+/, "").trim();
                if (!cleanLine) return null;
                return (
                  <li key={`li-${paraIdx}-${lineIdx}`} className="text-neutral-700">
                    {parseInlineStyles(cleanLine)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Standard Paragraph
        return (
          <p key={`p-${paraIdx}`} className="text-neutral-600 text-sm">
            {parseInlineStyles(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

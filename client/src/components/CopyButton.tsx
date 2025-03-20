import { Copy } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps {
  text: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="relative flex items-center justify-center text-gray-700 p-1 rounded-full hover:bg-gray-50"
    >
      {copied && (
        <span className="absolute top-0 bg-gray-800 text-white rounded-md font-light text-xs px-1">
          Copied!
        </span>
      )}
      <Copy size={18} />
    </button>
  );
};

export default CopyButton;

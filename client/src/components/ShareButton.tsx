import { Share } from "lucide-react";

interface ShareButtonProps {
  text: string;
  url?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  text,
  url = window.location.href,
}) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Meeting Summary",
          text: text,
          url: url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      alert("Sharing not supported! Copy the summary manually.");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="relative flex items-center justify-center text-gray-700 p-1 rounded-full hover:bg-gray-50"
    >
      <Share size={18} />
    </button>
  );
};

export default ShareButton;

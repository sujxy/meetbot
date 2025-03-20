import { Copy } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import CopyButton from "./CopyButton";
import ShareButton from "./ShareButton";

interface SummaryCardProps {
  meetingId: string;
  title: string;
  date: string;
  duration: string;
  tags: string[];
  keypoints: string[];
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  meetingId,
  title,
  date,
  duration,
  tags,
  keypoints,
}) => {
  return (
    <div className="bg-white rounded-md my-4 shadow border border-gray-200">
      <div className="flex items-center justify-between   p-4  border-b border-gray-200">
        <span className="">
          <Link
            to={`/summary/${meetingId}`}
            className="font-semibold hover:underline "
          >
            {title}
          </Link>
          <p className="text-gray-500 font-light text-sm ">
            {date} • {duration}
          </p>
          <span className="flex gap-2 pt-2 items-center justify-start">
            {tags.map((tag) => (
              <span className="bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-800">
                {tag}
              </span>
            ))}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <ShareButton
            text={keypoints.join(",")}
            url={window.location.href + `/${meetingId}`}
          />
          <CopyButton text={keypoints.join(",")} />
        </span>
      </div>

      <div className="px-4 py-2">
        <h2 className="font-medium text-sm "> Keypoints</h2>
        <ol className="list-disc pl-6 my-2 text-sm  text-gray-600">
          {keypoints.map((key) => (
            <li>{key}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default SummaryCard;

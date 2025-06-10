import React from "react";
import { Link } from "react-router-dom";
import CopyButton from "./CopyButton";
import ShareButton from "./ShareButton";
import { ShieldAlert, Sparkle } from "lucide-react";

interface SummaryCardProps {
  meetingId: string;
  title: string;
  date: string;
  duration: string;
  tags: string[];
  keypoints: string[];
  isSummarized: boolean;
  matchedChunks: string[];
  score: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  meetingId,
  title,
  date,
  duration,
  tags,
  keypoints,
  isSummarized,
  matchedChunks,
  score,
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
          {score && (
            <span className="center-div px-2 text-sm font-semibold rounded-full border border-violet-900 text-violet-900 ">
              {Math.round(score * 100)}%
            </span>
          )}
          <ShareButton
            text={keypoints.join(",")}
            url={window.location.href + `/${meetingId}`}
          />
          <CopyButton text={keypoints.join(",")} />
        </span>
      </div>

      {isSummarized ? (
        <>
          <div className="px-4 py-2">
            <h2 className="font-medium text-sm "> Keypoints</h2>
            <ol className="list-disc pl-6 my-2 text-sm  text-gray-600">
              {keypoints.map((key) => (
                <li>{key}</li>
              ))}
            </ol>
          </div>
          {matchedChunks && (
            <div className="px-4 py-2 border border-violet-900 rounded-md m-2 bg-violet-50/60">
              <span className="flex justify-start gap-2 text-violet-900">
                <Sparkle size={12} />
                <h2 className="font-medium text-sm ">Matched Transcripts</h2>
              </span>
              <ol className="list-none pl-6 my-2 text-sm italic  text-violet-700">
                {matchedChunks.map((key) => (
                  <li>"{key}"</li>
                ))}
              </ol>
            </div>
          )}
        </>
      ) : (
        <div className="w-full flex items-center justify-between px-4">
          <div className="rounded-md border border-gray-200 px-3 py-2 bg-amber-50 my-2 ">
            <div className="flex gap-2 items-center">
              <div className="flex-shrink-0 text-amber-600 ">
                <ShieldAlert />
              </div>
              <div className="text-sm text-amber-800">
                This meeting has not been analysed yet. Click on the meeting to
                generate summary now !
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;

import axios from "axios";
import {
  Copy,
  Loader2,
  LoaderCircle,
  Share,
  Sparkles,
  Trash,
} from "lucide-react";
import { useEffect, useState } from "react";
import CopyButton from "../components/CopyButton";
import ShareButton from "../components/ShareButton";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};
const MeetingView = ({ meetingId }: { meetingId: string }) => {
  const [meetingSummary, setMeetingSummary] = useState<string>("");
  const [meetingData, setMeetingData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleDeleteSession = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/meeting/delete/${meetingId}`);
    } catch (err: any) {
      alert("failed to delete session");
    } finally {
      setLoading(false);
    }
  };
  const generateSummary = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/summarize?meetId=${meetingId}`);
      if (data.success) {
        setMeetingSummary(data.summary);
      }
    } catch (err: any) {
      alert("Error generating summary !");
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetingSummary = async () => {
    try {
      const { data } = await axios.get(`/summary?meetId=${meetingId}`);
      if (data.success) {
        setMeetingSummary(data.summary);
      }
    } catch (err: any) {
      alert("Error getting summary !");
    }
  };

  const fetchMeetingInfo = async () => {
    try {
      const { data } = await axios.get(`/meeting/${meetingId}`);
      if (data.success) {
        setMeetingData(data.data);
      }
    } catch (err: any) {
      alert("Error getting meeting !");
    }
  };

  useEffect(() => {
    fetchMeetingInfo();
    fetchMeetingSummary();
  }, []);

  return (
    <div className="mx-6 xl:mx-18">
      {meetingData ? (
        <div className=" my-4 w-full flex justify-between items-start ">
          <span>
            <h1 className="font-semibold text-3xl">{meetingData.title}</h1>
            <p className="text-md text-gray-400">
              {formatDate(meetingData.createdAt)} • {meetingData.duration}
            </p>
          </span>
        </div>
      ) : (
        <span className="w-full flex justify-center">
          <Loader2 className="animate-spin" />
        </span>
      )}
      <div
        id={"summary-container"}
        className="mt-4 p-4 border border-gray-200 rounded-md bg-white"
      >
        <span className="flex justify-between items-center mb-4 ">
          <span className="flex items-center gap-2 ">
            <Sparkles size={20} />
            <h2 className="font-semibold text-xl ">Meeting Summary</h2>
          </span>
          <span className="flex items-center gap-4">
            <CopyButton text={meetingSummary} />
            <ShareButton text={meetingSummary} />
          </span>
        </span>
        {meetingSummary ? (
          <div
            className=" px-4 text-md font-light text-gray-700"
            dangerouslySetInnerHTML={{ __html: meetingSummary }}
          ></div>
        ) : (
          <span className="w-full flex justify-center">
            <Loader2 className="animate-spin" />
          </span>
        )}
      </div>
      <div className="my-2 flex items-center gap-2 justify-start">
        <button
          onClick={generateSummary}
          className="bg-gray-800 text-sm text-gray-50  flex justify-center items-center gap-2 p-2 rounded-md hover:bg-gray-700 "
        >
          {loading ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          <span className="">Regenerate</span>
        </button>
        <button
          onClick={handleDeleteSession}
          className="bg-red-500/80 text-sm text-gray-50 flex justify-center items-center gap-2 p-2 rounded-md hover:bg-red-500 "
        >
          {loading ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <Trash size={18} />
          )}
          <span className="">Delete Session</span>
        </button>
      </div>
    </div>
  );
};

export default MeetingView;

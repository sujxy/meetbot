import axios from "axios";
import { Loader2, LoaderCircle, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import SummaryContentViewer from "../components/SummaryContentViewer";
import SummaryEventsViewer from "../components/SummaryEventsViewer";
import toast from "react-hot-toast";

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
  const [meetingData, setMeetingData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchMeetingInfo = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/meeting/${meetingId}`);
      if (data.success) {
        setMeetingData(data.data);
      }
    } catch (err: any) {
      toast.error("Error getting meeting !");
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`/summary/generate`, {
        meetId: meetingId,
        duration: "00:00",
      });
      if (data.success) {
        setMeetingData(data.updatedMeeting);
        toast.success("Summary generated successfully!");
      }
    } catch (err: any) {
      toast.error("Error generating summary !");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingInfo();
  }, []);

  if (loading) {
    return (
      <span className="w-full flex justify-center">
        <Loader2 className="animate-spin" />
      </span>
    );
  }

  return (
    <div className="mx-6 xl:mx-18">
      <div className=" my-4 w-full flex justify-between items-start ">
        <span>
          <h1 className="font-semibold text-3xl">{meetingData?.title}</h1>
          <p className="text-md text-gray-400">
            {formatDate(meetingData?.createdAt)} • {meetingData?.duration}
          </p>
        </span>
      </div>
      {meetingData?.isSummarized ? (
        <>
          <SummaryContentViewer meetingId={meetingId} />
          <SummaryEventsViewer meetingId={meetingId} />
        </>
      ) : (
        <div className="w-full rounded-md border border-gray-200 items-center bg-white p-4 flex justify-between gap-2">
          <p className="text-gray-700">
            Your meeting has not been analysed yet.{" "}
          </p>
          <button
            onClick={generateSummary}
            className="bg-gray-800 text-sm text-gray-50 flex justify-center items-center gap-2 p-2 rounded-md hover:bg-gray-700"
          >
            {loading ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}
            <span className="">Analyze now</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MeetingView;

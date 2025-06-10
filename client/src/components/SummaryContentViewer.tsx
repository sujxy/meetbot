import { Loader2, LoaderCircle, Sparkles, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import CopyButton from "./CopyButton";
import ShareButton from "./ShareButton";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
export default function SummaryContentViewer({
  meetingId,
}: {
  meetingId: string;
}) {
  const [meetingSummary, setMeetingSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const fetchMeetingSummary = async () => {
    try {
      const { data } = await axios.get(`/summary?meetId=${meetingId}`);
      if (data.success) {
        setMeetingSummary(data.summary);
      }
    } catch (err: any) {
      toast.error("Error getting summary !");
    }
  };
  const regenerateSummary = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/summary/regenerate`, {
        meetId: meetingId,
      });
      if (data.success) {
        setMeetingSummary(data.updatedSummary);
        toast.success("Summary re-generated successfully!");
      }
    } catch (err: any) {
      toast.error("Error generating summary !");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteSession = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/meeting/delete/${meetingId}`);
      if (data.success) {
        toast.success("Session deleted successfully!");
        navigate("/summary");
      }
    } catch (err: any) {
      toast.error("failed to delete session");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingSummary();
  }, []);

  return (
    <div
      id={"summary-container"}
      className="mt-4 relative border border-gray-200 rounded-md bg-white flex flex-col h-[80vh] overflow-hidden"
    >
      {/* Card Header */}
      <span className="flex justify-between border-b border-gray-200 items-center mb-0 p-4 sticky top-0 bg-white/80 backdrop-blur-md z-10 ">
        <span className="flex items-center gap-2 ">
          <Sparkles size={20} />
          <h2 className="font-semibold text-xl ">Meeting Summary</h2>
        </span>
        <span className="flex items-center gap-4">
          <CopyButton text={meetingSummary} />
          <ShareButton text={meetingSummary} />
        </span>
      </span>
      {/* Summary Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 text-md font-light text-gray-700">
        {meetingSummary ? (
          <div dangerouslySetInnerHTML={{ __html: meetingSummary }}></div>
        ) : (
          <span className="w-full flex justify-center pt-10">
            <Loader2 className="animate-spin" />
          </span>
        )}
      </div>
      {/* Action Buttons */}
      <div className="py-3 px-4 flex items-center gap-2 justify-end  border-gray-200 border-t bg-white sticky bottom-0 z-10">
        <button
          onClick={regenerateSummary}
          className="bg-gray-800 text-sm text-gray-50 flex justify-center items-center gap-2 p-2 rounded-md hover:bg-gray-700"
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
          className="bg-red-500/80 text-sm text-gray-50 flex justify-center items-center gap-2 p-2 rounded-md hover:bg-red-500"
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
}

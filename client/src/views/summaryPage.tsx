import axios from "axios";
import { useEffect, useState } from "react";
import SummaryCard from "../components/SummaryCard";
import { useParams } from "react-router-dom";
import MeetingView from "./meetingSummaryPage";
import { BrainCog, Loader2 } from "lucide-react";
import { formatDate } from "../utils/formatters";
import toast from "react-hot-toast";

const SummaryPage: React.FC = () => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [textQuery, setTextQuery] = useState<string>("");
  const { meetingId } = useParams();

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `/meeting/search-meetings?textQuery=${textQuery}`
      );
      if (data.success) {
        setMeetings(data.results);
      }
    } catch (err: any) {
      toast.error("Error getting related meetings !");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllMeetings = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/meeting/bulk`);
        if (data.success) {
          setMeetings(data.data);
        }
      } catch (err: any) {
        toast.error("Error getting meetings !");
      } finally {
        setLoading(false);
      }
    };
    fetchAllMeetings();
  }, []);

  if (meetingId) {
    return <MeetingView meetingId={meetingId} />;
  }

  return (
    <div className="mx-6 xl:mx-18">
      <div className=" py-2 bg-gray-50 z-10 sticky top-0 w-full flex justify-between items-start ">
        <span>
          <h1 className="font-semibold text-3xl">Meeting Summaries</h1>
          <p className="text-md text-gray-400">
            Browse and search through your meeting summaries
          </p>
        </span>
      </div>

      <div className="sticky top-18 mb-4 w-full bg-white rounded-md border border-gray-200 flex flex-col gap-2 p-4">
        <span className="w-full flex items-center gap-2  ">
          <input
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
            className="w-full h-full m-0 px-3 py-2 text-lg font-light text-gray-600 rounded-md border border-gray-200 outline-0 ring-0 "
            type={"text"}
            placeholder='"Find all meetings where budget was discussed.."'
          />
          <button
            onClick={fetchSearchResults}
            className="filled-btn center-div gap-2 "
          >
            <BrainCog size={18} />
            <p>Search</p>
          </button>
        </span>
        <span>
          <p className="font-semibold text-lg ps-2">
            Meetings found : {meetings.length}{" "}
          </p>
        </span>
      </div>

      <div className="mt-8">
        {loading ? (
          <span className="w-full py-12 center-div">
            <Loader2 className="animate-spin" />
          </span>
        ) : (
          meetings?.map((meet) => {
            return (
              <SummaryCard
                key={meet._id}
                meetingId={meet._id}
                date={formatDate(meet.updatedAt)}
                title={meet.title}
                duration={meet.duration}
                tags={meet.tags}
                keypoints={meet.keypoints}
                isSummarized={meet.isSummarized}
                matchedChunks={meet.matchedChunks}
                score={meet.score}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default SummaryPage;

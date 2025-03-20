import axios from "axios";
import { useEffect, useState } from "react";
import SummaryCard from "../components/SummaryCard";
import { useParams } from "react-router-dom";
import MeetingView from "./meetingSummaryPage";

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
const SummaryPage: React.FC = () => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { meetingId } = useParams();
  console.log(meetingId);

  useEffect(() => {
    const fetchAllMeetings = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/meeting/bulk`);
        if (data.success) {
          setMeetings(data.data);
        }
      } catch (err: any) {
        alert("error fetching meetings !");
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
      <div className=" my-4 bg-gray-50 z-10 sticky top-2 w-full flex justify-between items-start ">
        <span>
          <h1 className="font-semibold text-3xl">Meeting Summaries</h1>
          <p className="text-md text-gray-400">
            Browse and search through your meeting summaries
          </p>
        </span>
      </div>

      <div className="mt-8">
        {meetings?.map((meet) => {
          return (
            <SummaryCard
              key={meet._id}
              meetingId={meet._id}
              date={formatDate(meet.updatedAt)}
              title={meet.title}
              duration={meet.duration}
              tags={meet.tags}
              keypoints={meet.keypoints}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SummaryPage;

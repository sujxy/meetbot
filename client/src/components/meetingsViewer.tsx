import axios from "axios";
import { Calendar, Clock, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { formatDate } from "../utils/formatters";

interface MeetingsViewerProps {
  setCurrentChat?: (chatId: string | null) => void;
  currentChat?: string | null;
}

const MeetingsViewer: React.FC<MeetingsViewerProps> = ({
  currentChat,
  setCurrentChat,
}) => {
  const [allMeetings, setAllMeetings] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    const fetchAllMeetings = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/meeting/bulk`);
        if (data.success) {
          setAllMeetings(data.data);
        }
      } catch (err: any) {
        alert("error fetching meetings !");
      } finally {
        setLoading(false);
      }
    };
    fetchAllMeetings();
  }, []);
  return (
    <div className="col-span-1 border border-gray-200 rounded-md bg-white h-full">
      <div className=" py-4 px-6 w-full flex justify-between items-start sticky top-0 bg-white">
        <span className="">
          <h1 className="font-semibold text-2xl">Select a Meeting</h1>
          <p className="text-sm text-gray-400">
            Choose a meeeting to chat about
          </p>
        </span>
      </div>
      <div>
        {loading ? (
          <span className="h-full w-full center-div">
            <Loader2 className="animate-spin" />
          </span>
        ) : (
          <div className="flex flex-col max-h-[500px] gap-3 p-4 overflow-y-auto">
            {allMeetings.map((meet: any, i: number) => {
              return (
                <div
                  key={i}
                  onClick={() => setCurrentChat?.(meet._id)}
                  className={`${
                    currentChat == meet._id
                      ? "border-gray-700 bg-gray-50"
                      : "border-gray-200"
                  } border  rounded-md flex flex-col gap-1 p-2`}
                >
                  <span className="font-semibold ">{meet.title}</span>
                  <span className=" text-gray-500 font-light gap-1 text-sm flex items-center justify-start">
                    <Calendar size={12} />
                    <p>{formatDate(meet.updatedAt)}</p>
                  </span>
                  <span className=" text-gray-500 font-light gap-1 text-sm flex items-center justify-start">
                    <Clock size={12} />
                    <p>{meet.duration}</p>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingsViewer;

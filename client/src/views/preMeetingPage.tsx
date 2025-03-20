import axios from "axios";
import { Loader2, Monitor, ShieldAlert } from "lucide-react";
import { useState } from "react";

const PreMeetingState = ({
  setPageState,
}: {
  setPageState: React.Dispatch<React.SetStateAction<"during" | "pre" | "post">>;
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleJoinMeeting: () => Promise<void> = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post("/meeting/new");
      if (data) {
        localStorage.setItem("MEET_ID", data.meetId);
        setPageState("during");
      }
    } catch (err: any) {
      alert("error creating meeting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-6 xl:mx-18">
      <div className=" my-4 w-full flex justify-between items-start ">
        <span>
          <h1 className="font-semibold text-3xl">Join a Meeting</h1>
          <p className="text-md text-gray-400">
            Connect to an ongoing meeting to create summary
          </p>
        </span>
      </div>
      <div className="mt-12 p-4 border border-gray-200 rounded-md bg-white w-4/5 md:w-3/5 lg:w-2/5  mx-auto flex flex-col gap-4">
        <span className="mb-4">
          <h2 className="font-semibold text-xl ">Share Browser Tab</h2>
          <p className="text-sm text-gray-500">
            Join a meeting by sharing your Chrome browser tab
          </p>
        </span>

        <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-2">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <Monitor className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Chrome Tab Sharing</h3>
              <p className="text-xs text-gray-500">
                Share your meeting tab directly from Chrome
              </p>
            </div>
          </div>
        </div>

        <div className="">
          <h3 className="text-sm font-medium">How it works:</h3>
          <ol className="list-decimal pl-5 text-sm  text-gray-600">
            <li>Click the "Share Tab" button below</li>
            <li>Select the browser tab with your meeting</li>
            <li>MeetBot will join and start transcribing</li>
          </ol>
        </div>

        <div className="rounded-md border border-gray-200 p-3 bg-amber-50 my-2 ">
          <div className="flex gap-2 items-center">
            <div className="flex-shrink-0 text-amber-600 ">
              <ShieldAlert />
            </div>
            <div className="text-sm text-amber-800">
              You'll need to grant screen sharing permissions
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={handleJoinMeeting}
            className="bg-gray-800 text-sm text-gray-50  w-full flex justify-center items-center gap-2 p-2 rounded-md hover:bg-gray-700 "
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Monitor className="mr-2 h-4 w-4" />
            )}
            Start Sharing
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreMeetingState;

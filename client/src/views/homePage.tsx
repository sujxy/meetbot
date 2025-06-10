import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  ExternalLink,
  Loader,
  Users,
  Video,
} from "lucide-react";
import axios from "axios";

const HomePage: React.FC = () => {
  const currentHour = new Date().getHours();
  let greeting = "Good evening";

  //const navigate = useNavigate();

  const [eventsLoading, setEventsLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<any>([]);

  if (currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour < 18) {
    greeting = "Good afternoon";
  }

  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    const fetchAllEvents = async () => {
      setEventsLoading(true);
      try {
        const { data } = await axios.get(`/user/events`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (data.success) {
          setEvents(data.events);
        }
      } catch (err: any) {
        alert("error fetching events !");
      } finally {
        setEventsLoading(false);
      }
    };
    fetchAllEvents();
  }, []);

  return (
    <div className="mx-6 2xl:mx-18">
      <div className=" my-4 w-full flex justify-between items-start ">
        <span>
          <h1 className="font-semibold text-3xl">{greeting}, Sujay!</h1>
          <p className="text-md text-gray-400">
            Here's whats happening with your meetings
          </p>
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3 my-8">
        {/* Today's Meetings Card */}
        <div className="rounded-lg border border-gray-200 bg-card bg-white shadow-sm p-4">
          <div className="pb-2">
            <div className="text-sm font-medium text-gray-800">
              Today's Meetings
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-gray-500">{events.length} upcoming</p>
          </div>
        </div>
        {/* Hours Saved Card */}
        <div className="rounded-lg border border-gray-200 bg-card bg-white shadow-sm p-4">
          <div className="pb-2">
            <div className="text-sm font-medium text-gray-800">Hours Saved</div>
          </div>
          <div>
            <div className="text-2xl font-bold">18.5</div>
            <p className="text-xs text-gray-500">+2.5 from last week</p>
          </div>
        </div>
        {/* Next Meeting Card */}
        <div className="rounded-lg border border-gray-200 bg-card bg-white shadow-sm p-4">
          <div className="pb-2">
            <div className="text-sm font-medium text-gray-800">
              Next Meeting
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {events.length > 0
                ? formatTime(events[0].start.dateTime)
                : "None"}
            </div>
            <p className="text-xs text-gray-500">
              {events.length > 0 ? events[0].summary : "No meetings scheduled"}
            </p>
          </div>
        </div>
      </div>

      <div className=" rounded-md  py-2">
        <span className="w-full flex items-center justify-start gap-1 mb-4">
          <Calendar className="" size={22} />
          <h2 className="font-semibold  text-xl">Today's Calendar</h2>
        </span>
        <span className="flex flex-col  w-full">
          {eventsLoading ? (
            <Loader className="animate-spin" />
          ) : (
            events?.map((e: any) => (
              <div
                key={e.id}
                className="p-4 rounded-md border border-gray-200  flex items-center justify-between  bg-white mb-2"
              >
                <span className="flex flex-col gap-1 justify-evenly items-start">
                  <h3 className="font-semibold text-md ">{e.summary}</h3>
                  <span className="flex gap-1 items-center">
                    <Clock className=" text-gray-400" size={18} />
                    <p className="text-sm text-gray-400">
                      {formatTime(e.start.dateTime)} -{" "}
                      {formatTime(e.end.dateTime)}
                    </p>
                  </span>
                  <span className="flex gap-1 items-center">
                    <Users className=" text-gray-400" size={18} />
                    <p className="text-sm text-gray-400">
                      {e.attendees?.length}
                    </p>
                  </span>
                </span>
                <span className="flex gap-2">
                  <Link
                    to={e.hangoutLink}
                    className="outline-btn flex gap-1 items-center justify-around"
                  >
                    <ExternalLink className="" size={18} />
                    <p>Open Link</p>
                  </Link>
                  <button className="filled-btn flex gap-1 items-center justify-around">
                    <Video size={18} />
                    <p>Join</p>
                  </button>
                </span>
              </div>
            ))
          )}
        </span>
      </div>
    </div>
  );
};

export default HomePage;

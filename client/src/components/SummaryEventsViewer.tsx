import axios from "axios";
import { Calendar, Check, Clock, Loader, LoaderCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

import { formatLongDate } from "../utils/formatters";
import toast from "react-hot-toast";

interface MeetingEventItemType {
  _id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  addedToCalendar: boolean;
  author: "AI" | "USER";
  onAdded: (eventId: string) => void;
}

const MeetingEventItem: React.FC<MeetingEventItemType> = ({
  _id,
  title,
  description,
  startTime,
  endTime,
  addedToCalendar,

  date,
  onAdded,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const updateUserCalendarWithEvent = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`/user/create-event`, {
        eventId: _id,
      });
      if (data.success) {
        onAdded(_id);
        toast.success("Event added to calendar successfully!");
      }
    } catch (err: any) {
      toast.error("Error generating summary !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-md border border-gray-200  flex items-center justify-between  bg-white mb-2">
      <span className="flex flex-col gap-1 justify-evenly items-start">
        <h3 className="font-semibold text-md ">{title}</h3>
        <span className="flex gap-1 items-center  text-gray-500">
          <Calendar className="" size={18} />
          <p className="text-sm">{formatLongDate(date)}</p>
          <Clock className=" ms-2" size={18} />
          <p className="text-sm">
            {startTime} - {endTime}
          </p>
        </span>
        <span className="flex gap-1 items-center">
          <p className="text-sm text-gray-400">{description}</p>
        </span>
      </span>
      <span className="flex gap-2">
        {addedToCalendar ? (
          <div className="filled-btn flex gap-1 items-center justify-around">
            <Check size={18} />
            <p>Added</p>
          </div>
        ) : (
          <button
            onClick={updateUserCalendarWithEvent}
            className="outline-btn flex gap-1 items-center justify-around"
          >
            {loading ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Calendar size={18} />
            )}
            <p>Add</p>
          </button>
        )}
      </span>
    </div>
  );
};

export default function SummaryEventsViewer({
  meetingId,
}: {
  meetingId: string;
}) {
  const [meetingEvents, setMeetingEvents] = useState<any>([]);
  const [eventsLoading, setEventsLoading] = useState<boolean>(false);

  const fetchMeetingEvents = async () => {
    setEventsLoading(true);
    try {
      const { data } = await axios.get(
        `/user/meeting-events?meetId=${meetingId}`
      );
      if (data.success) {
        setMeetingEvents(data.events);
      }
    } catch (err: any) {
      toast.error("Error getting events !");
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingEvents();
  }, [meetingId]);

  const markEventAsAdded = (eventId: string) => {
    setMeetingEvents((prev: any[]) =>
      prev.map((event) =>
        event._id === eventId ? { ...event, addedToCalendar: true } : event
      )
    );
  };

  return (
    <div className="w-full my-4 px-1">
      <span className="w-full flex items-center justify-start gap-1 mb-4">
        <Calendar className="" size={22} />
        <h2 className="font-semibold  text-xl">Identified Events</h2>
      </span>
      <div className="w-full flex flex-col gap-2 justify-evenly ">
        {eventsLoading ? (
          <Loader className="animate-spin" />
        ) : (
          meetingEvents?.map((e: any, id: any) => (
            <MeetingEventItem
              key={id}
              _id={e._id}
              title={e.title}
              description={e.description}
              date={e.date}
              startTime={e.startTime}
              endTime={e.endTime}
              addedToCalendar={!!e.addedToCalendar}
              author={e.author}
              onAdded={markEventAsAdded}
            />
          ))
        )}
        {!eventsLoading && meetingEvents.length == 0 && (
          <span className="w-full center-div h-18">No events !</span>
        )}
      </div>
    </div>
  );
}

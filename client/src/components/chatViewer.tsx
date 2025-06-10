import {
  Bot,
  Calendar,
  CircleCheck,
  Clock,
  Ellipsis,
  Loader2,
  Send,
} from "lucide-react";
import { formatDate } from "../utils/formatters";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useUserContext } from "../context/userContext";

interface MessageProps {
  content?: string;
  sender?: "USER" | "AI";
  hasFile?: boolean;
  fileURL?: string;
  isLoader?: boolean;
}

const MessageItem: React.FC<MessageProps> = ({
  content,
  sender,
  isLoader,
  hasFile,
  fileURL,
}) => {
  const { user } = useUserContext();

  if (isLoader) {
    return (
      <div className="flex items-start justify-start gap-2 p-2">
        <span className="center-div w-8 h-8 rounded-full">
          <Bot size={16} />
        </span>
        <span className="text-md bg-gray-100 p-3 rounded-lg">
          <Ellipsis className="animate-pulse" />
        </span>
      </div>
    );
  }

  return (
    <div
      id={"chat-container"}
      className={`items-start flex gap-2 ${
        sender === "AI" ? "justify-start pe-12" : "justify-end ps-12"
      } p-3 rounded-lg`}
    >
      {sender === "AI" ? (
        <>
          <div className="w-8 h-8 rounded-full center-div bg-gray-100">
            <Bot size={16} />
          </div>
          <div className=" w-fit bg-gray-100 p-2 rounded-md">
            <p
              className=" font-light "
              dangerouslySetInnerHTML={{ __html: content || "" }}
            ></p>
            {hasFile && (
              <span className="p-4 text-sm rounded-md border border-gray-300 bg-white flex gap-2 items-center justify-between">
                <span className="center-div gap-2">
                  <CircleCheck size={28} className="text-green-600" />
                  <h2 className="font-semibold">File generated.</h2>
                </span>
                <a
                  href={fileURL}
                  className="filled-btn font-light text-gray-600"
                  target="blank"
                >
                  View file
                </a>
              </span>
            )}
          </div>
        </>
      ) : (
        <>
          <p
            className=" font-light w-fit bg-gray-800 text-gray-50 p-2 rounded-md"
            dangerouslySetInnerHTML={{ __html: content || "" }}
          ></p>
          <div className="w-8 h-8 rounded-full overflow-clip center-div bg-gray-300">
            <img
              className="flex h-full w-full items-center justify-center text-xs font-medium"
              src={user?.picture}
            />
          </div>
        </>
      )}
    </div>
  );
};

interface ChatViewerProps {
  meetingId?: string | null;
}

const ChatViewer: React.FC<ChatViewerProps> = ({ meetingId }) => {
  const [meetingData, setMeetingData] = useState<any | null>(null);
  const [userQuery, setUserQuery] = useState<string>("");
  const [chatData, setChatData] = useState<any>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchMeetingAndChatData = async () => {
      if (!meetingId) {
        setMeetingData(null);
        setChatData([]);
        return;
      }
      setLoading(true);
      try {
        // Fetch meeting data
        const meetingRes = await axios.get(`/meeting/${meetingId}`);
        if (meetingRes.data.success) {
          setMeetingData(meetingRes.data.data);
        }
        // Fetch chat data
        const chatRes = await axios.get(`/meeting/${meetingId}/chat`);
        if (chatRes.data.success) {
          setChatData(chatRes.data.messages);
        }
      } catch (err: any) {
        alert("Error fetching meeting or chat data!");
        setMeetingData(null);
        setChatData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMeetingAndChatData();
  }, [meetingId]);

  const handleSendChat = async () => {
    setChatData((prev: any) => [
      ...prev,
      { content: userQuery, sender: "USER" },
    ]);
    await postUserQuery();
  };

  const postUserQuery = async () => {
    setIsTyping(true);
    try {
      const { data } = await axios.post(`/meeting/${meetingId}/chat`, {
        userMessage: userQuery,
      });
      if (data.success) {
        setChatData((prev: any) => [
          ...prev,
          {
            content: data.message,
            sender: "AI",
            hasFile: data.hasFile,
            fileURL: data.fileURL,
          },
        ]);
      }
    } catch (err: any) {
      alert("Error sending message!");
    } finally {
      setUserQuery("");
      setIsTyping(false);
    }
  };

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatData]);

  return (
    <div className="col-span-3 h-[80vh] border border-gray-200 rounded-md bg-white flex flex-col">
      {/* top section */}
      <div className="py-4 px-6 w-full flex justify-between items-start border-b border-gray-200 sticky top-0 bg-white z-10">
        {meetingData ? (
          <span className="flex flex-col gap-1">
            <span className="font-semibold text-2xl">
              Chat about : {meetingData.title}
            </span>
            <span className=" text-gray-500 font-light gap-1 text-sm flex items-center justify-start">
              <Calendar size={12} />
              <p>{formatDate(meetingData.updatedAt)}</p>
              <Clock size={12} className="ms-2" />
              <p>{meetingData.duration}</p>
            </span>
          </span>
        ) : (
          <span className="flex items-center gap-2 font-semibold">
            <Bot size={18} />
            <h1 className="font-semibold text-2xl">
              Select a meeting to start chatting.
            </h1>
          </span>
        )}
      </div>
      {/* chats viewer */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 min-h-0"
      >
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : (
          chatData?.map((message: any, i: number) => {
            return (
              <MessageItem
                key={i}
                content={message.content}
                sender={message.sender}
                hasFile={message.hasFile || false}
                fileURL={message.fileURL || ""}
              />
            );
          })
        )}
        {isTyping && <MessageItem isLoader={true} />}
      </div>
      {/* bottom section */}
      <div className="border-t border-gray-200 p-4 sticky bottom-0 bg-white z-10">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask a question about this meeting..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className="flex-1 border border-gray-300  rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <button
            onClick={handleSendChat}
            disabled={!userQuery.trim() || loading}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center"
          >
            <Send />
          </button>
        </div>
        <div className="mt-2  flex flex-wrap gap-2">
          <button
            type="button"
            className="border border-gray-300 rounded-md font-semibold px-3 py-1 text-sm cursor-pointer hover:bg-gray-100 transition"
            onClick={() => setUserQuery("What were the main decisions made?")}
          >
            What decisions were made?
          </button>
          <button
            type="button"
            className="border border-gray-300 rounded-md font-semibold px-3 py-1 text-sm cursor-pointer hover:bg-gray-100 transition"
            onClick={() => setUserQuery("What are the action items?")}
          >
            Action items
          </button>
          <button
            type="button"
            className="border border-gray-300 rounded-md font-semibold px-3 py-1 text-sm cursor-pointer hover:bg-gray-100 transition"
            onClick={() => setUserQuery("Who participated in this meeting?")}
          >
            Who participated?
          </button>
          <button
            type="button"
            className="border border-gray-300 rounded-md font-semibold px-3 py-1 text-sm cursor-pointer hover:bg-gray-100 transition"
            onClick={() => setUserQuery("What are the next steps?")}
          >
            Next steps
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatViewer;

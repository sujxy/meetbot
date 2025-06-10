import React, { useState } from "react";

import MeetingsViewer from "../components/meetingsViewer";
import ChatViewer from "../components/chatViewer";

const ChatPage: React.FC = () => {
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  return (
    <div className="mx-6 2xl:mx-18">
      <div className=" my-4 w-full flex justify-between items-start ">
        <span>
          <h1 className="font-semibold text-3xl">Chat with Meeting</h1>
          <p className="text-md text-gray-400">
            Get more from a meeting by conversing with it.
          </p>
        </span>
      </div>
      <div className="w-full min-h-[80vh] grid grid-cols-4 gap-2">
        <MeetingsViewer
          currentChat={currentChat}
          setCurrentChat={setCurrentChat}
        />
        <ChatViewer meetingId={currentChat} />
      </div>
    </div>
  );
};

export default ChatPage;

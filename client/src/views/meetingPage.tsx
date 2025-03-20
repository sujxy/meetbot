import axios from "axios";
import {
  CheckCircle2,
  Clock,
  Disc,
  LoaderCircle,
  MessageSquareQuote,
  Monitor,
  ScreenShare,
  ScreenShareOff,
  Sparkles,
  Trash,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import PreMeetingState from "./preMeetingPage";
import { useNavigate } from "react-router-dom";

const MeetingPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<string>("");
  //const [currentChunk, setCurrentChunk] = useState<string>("");
  const [transcriptQueue, setTranscriptQueue] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioProcessorRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const isTyping = useRef<boolean>(false);
  const elapsedTimeRef = useRef<number | null>(null);
  const [pageState, setPageState] = useState<"pre" | "during" | "post">("pre");
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (!currentChunk) return;

  //   let i = 0;
  //   const interval = setInterval(() => {
  //     setTranscripts((prev) => prev + currentChunk[i]);
  //     i++;
  //     if (i >= currentChunk.length) {
  //       clearInterval(interval);
  //       setCurrentChunk("");
  //     }
  //   }, 50);

  //   return () => clearInterval(interval);
  // }, [currentChunk]);

  const processTranscriptQueue = () => {
    console.log("Process queue called");
    if (isTyping.current || transcriptQueue.length === 0) return;

    isTyping.current = true;
    let chunk = transcriptQueue[0];
    let i = 0;
    const interval = setInterval(() => {
      setTranscripts((prev) => prev + chunk[i]);
      i++;
      if (i >= chunk.length) {
        clearInterval(interval);
        isTyping.current = false;
        setTranscriptQueue((prev) => prev.slice(1));
      }
    }, 50);
  };

  useEffect(() => {
    if (transcriptQueue.length > 0 && !isTyping.current) {
      processTranscriptQueue();
    }
  }, [transcriptQueue]);

  useEffect(() => {
    if (isRecording) {
      elapsedTimeRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (elapsedTimeRef.current) {
        clearInterval(elapsedTimeRef.current);
      }
    }
    return () => {
      if (elapsedTimeRef.current) clearInterval(elapsedTimeRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    console.log("Recording");

    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
    });

    const audioContext = new AudioContext();
    await audioContext.audioWorklet.addModule("processor.js");

    const audioProcessor = new AudioWorkletNode(
      audioContext,
      "audio-processor"
    );
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(audioProcessor);
    audioProcessor.connect(audioContext.destination);

    const socket = io("http://localhost:8000");
    socketRef.current = socket;

    audioProcessor.port.onmessage = (event) => {
      const audioData = event.data;
      // Send the audio data to the backend
      socket.emit("audio_chunk", {
        meetId: localStorage.getItem("MEET_ID"),
        message: audioData,
      });
    };

    socket.on("transcription", (data) => {
      //setCurrentChunk(data);
      setTranscriptQueue((prev) => [...prev, data]);
    });

    audioContextRef.current = audioContext;
    audioProcessorRef.current = audioProcessor;
    mediaStreamRef.current = stream;
    setIsRecording(true);
  };

  const stopRecording = () => {
    console.log("Stopping recording");
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioProcessorRef.current) {
      audioProcessorRef.current.disconnect();
      audioProcessorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsRecording(false);
  };

  const generateSummary = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/summarize?meetId=${localStorage.getItem(
          "MEET_ID"
        )}&duration=${formatTime(timeElapsed)}`
      );
      if (data.success) {
        navigate(`/summary/${localStorage.getItem("MEET_ID")}`);
      }
    } catch (err: any) {
      alert("Error getting summary !");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleEndMeeting = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioProcessorRef.current) {
      audioProcessorRef.current.disconnect();
      audioProcessorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (elapsedTimeRef.current) {
      clearInterval(elapsedTimeRef.current);
      elapsedTimeRef.current = null;
    }
    setIsRecording(false);

    setPageState("post");
  };

  const handleDeleteSession = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `/meeting/delete/${localStorage.getItem("MEET_ID")}`
      );
      if (data.success) {
        localStorage.clear();
        setPageState("pre");
      }
    } catch (err: any) {
      alert("failed to delete session");
    } finally {
      setLoading(false);
    }
  };

  if (pageState === "during") {
    return (
      <div className="mx-6 xl:mx-18">
        <div className=" my-4 w-full flex justify-between items-center ">
          <span>
            <h1 className="font-semibold text-3xl">Active Meeting</h1>
            <span className="flex gap-2 items-center ">
              <span
                className={`flex items-center gap-1 w-fit ${
                  isRecording
                    ? "bg-red-500 text-gray-50  animate-pulse "
                    : "border border-gray-200 text-gray-500 "
                } rounded-full p-1 px-2 text-xs font-semibold `}
              >
                {isRecording && (
                  <Disc className="" strokeWidth={1.5} size={18} />
                )}
                <p className=" ">
                  {isRecording ? "Recording" : "Not Recording"}
                </p>
              </span>
              <span className="flex items-center gap-1 text-sm font-semibold text-gray-500">
                <Clock size={18} />
                {formatTime(timeElapsed) + "s"}
              </span>
            </span>
          </span>
          <button
            onClick={handleEndMeeting}
            className="bg-red-500/80 hover:bg-red-500 hover:cursor-pointer  text-gray-50 rounded-md px-2 py-2 "
          >
            End Meeting
          </button>
        </div>
        <div className="  p-4 border border-gray-200 rounded-md bg-white">
          <span className="flex justify-between items-center mb-4 ">
            <h3 className="font-semibold  text-xl ">Audio Source</h3>
            <span className="bg-gray-100 rounded-full px-2 text-sm font-semibold text-gray-700">
              Chrome Tab{" "}
            </span>
          </span>
          <span className="flex justify-between gap-2 items-center  ">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gray-500/10 flex items-center justify-center">
                <Monitor className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <p className="font-medium">Chrome Tab Audio</p>
                <p className="text-sm text-gray-500">
                  {isRecording
                    ? "Audio streaming active"
                    : "Waiting for audio..."}
                </p>
              </div>
            </div>

            {isRecording ? (
              <button
                onClick={stopRecording}
                className="bg-gray-800  text-gray-100 text-sm flex justify-center items-center gap-2 p-2 rounded-md hover:bg-gray-700"
              >
                <ScreenShareOff size={18} />
                <span>Stop Sharing</span>
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="bg-gray-800  text-gray-100 text-sm flex justify-center items-center gap-2 p-2 rounded-md hover:bg-gray-700"
              >
                <ScreenShare size={18} />
                <h2 className="">Share Tab</h2>
              </button>
            )}
          </span>
        </div>

        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-white">
          <span className="flex items-center gap-2 mb-4">
            <MessageSquareQuote strokeWidth={2} size={20} />
            <h2 className="font-semibold text-xl ">Live Transcription</h2>
          </span>

          <span className="border-s-2 flex border-gray-200 italic px-4 text-md font-light text-gray-500">
            {!transcripts ? (
              <span className="flex items-center gap-2">
                <LoaderCircle size={18} className="animate-spin" />
                <p>Waiting for audio...</p>
              </span>
            ) : (
              <p>{transcripts}</p>
            )}
          </span>
        </div>
      </div>
    );
  }

  if (pageState === "post") {
    return (
      <div className="mx-6 xl:mx-18">
        <div className=" my-4 w-full flex justify-between items-start ">
          <span>
            <h1 className="font-semibold text-3xl">Meeting Ended</h1>
            <p className="text-md text-gray-400">
              Your meeting has ended. What would you like to do with this
              session?
            </p>
          </span>
        </div>

        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-white">
          <span className=" mb-4">
            <h2 className="font-semibold text-xl ">Meeting Summary</h2>
            <p className="text-sm text-gray-400">
              Duration: {formatTime(timeElapsed) + "s"}
            </p>
          </span>
          <div className="flex items-center gap-2 border border-gray-100 rounded-md px-2 py-1 my-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <h4 className="font-medium">AI Summary Ready</h4>
              <p className="text-sm text-gray-500">
                Our AI can generate a comprehensive summary of this meeting
              </p>
            </div>
          </div>
          <div className="w-full flex items-center justify-start gap-2 mt-4">
            <button
              onClick={generateSummary}
              className="bg-gray-800 text-sm text-gray-50  flex justify-center items-center gap-2 p-2 rounded-md hover:bg-gray-700 "
            >
              {loading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              <span className="">Generate Summary</span>
            </button>
            <button
              onClick={handleDeleteSession}
              className="bg-red-500/80 text-sm text-gray-50 flex justify-center items-center gap-2 p-2 rounded-md hover:bg-red-500 "
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
      </div>
    );
  }

  return <PreMeetingState setPageState={setPageState} />;
};

export default MeetingPage;

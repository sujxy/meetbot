import axios from "axios";
import {
  Copy,
  Disc,
  LoaderCircle,
  MessageSquareQuote,
  ScreenShare,
  ScreenShareOff,
  Share,
  Sparkles,
} from "lucide-react";
import { useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const MEET_ID = "12345";

const MeetingPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [meetingSummary, setMeetingSummary] = useState<string>("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioProcessorRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const startRecording = async () => {
    console.log("Recording");
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
    });
    console.log(stream);
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
      socket.emit("audio_chunk", { meetId: MEET_ID, message: audioData });
      console.log(audioData);
    };

    socket.on("transcription", (data) => {
      setTranscripts((prev) => prev + " " + data);
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
        `http://localhost:8000/summarize?meetId=${MEET_ID}`
      );
      if (data.success) {
        setMeetingSummary(data.summary);
      }
    } catch (err: any) {
      alert("Error getting summary !");
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
        {isRecording && (
          <span className="flex items-center gap-1">
            <Disc
              className="text-red-500 animate-pulse "
              strokeWidth={1.5}
              size={20}
            />
            <p className="text-gray-400 font-semibold  ">Recording</p>
          </span>
        )}
      </div>
      <div className="  p-4 border border-gray-200 rounded-md bg-white">
        <span className="flex justify-between items-center mb-4 ">
          <h3 className="font-semibold  text-xl ">Audio Source</h3>
          <span className="bg-gray-100 rounded-full px-2 text-sm font-semibold text-gray-700">
            Chrome Tab{" "}
          </span>
        </span>
        <span className="flex justify-end gap-2 items-center  ">
          {transcripts && !isRecording && (
            <button
              onClick={generateSummary}
              className="bg-gray-100  t flex justify-center items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-200 "
            >
              {loading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              <span className="">Summarize</span>
            </button>
          )}
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="bg-gray-800  text-gray-100 flex justify-center items-center gap-2 px-4 py-1 rounded-md hover:bg-gray-700"
            >
              <ScreenShareOff size={18} />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="bg-gray-800  text-gray-100 flex justify-center items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-700"
            >
              <ScreenShare size={18} />
              <span className="">Join</span>
            </button>
          )}
        </span>
      </div>

      {meetingSummary && (
        <div
          id={"summary-container"}
          className="mt-4 p-4 border border-gray-200 rounded-md bg-white"
        >
          <span className="flex justify-between items-center mb-4 ">
            <span className="flex items-center gap-2 ">
              <Sparkles size={20} />
              <h2 className="font-semibold text-xl ">Meeting Summary</h2>
            </span>
            <span className="flex items-center gap-4">
              <Copy size={18} />
              <Share size={18} />
            </span>
          </span>

          <div
            className=" px-4 text-md font-light text-gray-700"
            dangerouslySetInnerHTML={{ __html: meetingSummary }}
          ></div>
        </div>
      )}

      <div className="mt-4 p-4 border border-gray-200 rounded-md bg-white">
        <span className="flex items-center gap-2 mb-4">
          <MessageSquareQuote strokeWidth={2} size={20} />
          <h2 className="font-semibold text-xl ">Live Transcription</h2>
        </span>

        <p className="border-s-2 border-gray-200 italic px-4 text-md font-light text-gray-500">
          {!transcripts ? "Waiting for audio..." : transcripts}
        </p>
      </div>
    </div>
  );
};

export default MeetingPage;

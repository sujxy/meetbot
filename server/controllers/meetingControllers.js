import { PineconeEmbeddings } from "@langchain/pinecone";
import Meeting from "../models/meeting.js";
import Summary from "../models/summary.js";
import Transcript from "../models/transcript.js";
import { Chat, Message } from "../models/chat.js";
import { Pinecone } from "@pinecone-database/pinecone";
import { extractLLMResponse, getRelevantChunks } from "../utils/utils.js";
import fs from "fs";
import Event from "../models/events.js";
import { generateMeetingPdfAndUpload } from "../tools/fileGenerator.js";

export const fetchSingleMeeting = async (req, res) => {
  try {
    const meetingData = await Meeting.findOne({
      _id: req.params.meetId,
    });

    res.status(200).json({
      success: true,
      data: meetingData,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const searchMeetings = async (req, res) => {
  try {
    const { textQuery } = req.query;
    const embeddings = new PineconeEmbeddings({
      model: "multilingual-e5-large",
    });
    const queryEmbedding = await embeddings.embedQuery(textQuery);

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pinecone.Index("meeting-transcripts-index");
    const pineconeResults = await index.query({
      vector: queryEmbedding,
      topK: 10,
      includeMetadata: true,
    });
    console.log("Pinecone results:", pineconeResults);

    // 3. Process matches
    const matches = pineconeResults.matches || [];
    // Map meetingId to highest score among its matches
    const meetingScoreMap = {};
    matches.forEach((m) => {
      const id = m.metadata.meetingId;
      if (!meetingScoreMap[id] || m.score > meetingScoreMap[id]) {
        meetingScoreMap[id] = m.score;
      }
    });
    // Sort meetingIds by descending score
    const meetingIdsSorted = Object.keys(meetingScoreMap).sort(
      (a, b) => meetingScoreMap[b] - meetingScoreMap[a]
    );

    // Map meetingId to matched chunk indexes
    const meetingChunksMap = {};
    matches.forEach((m) => {
      if (!meetingChunksMap[m.metadata.meetingId]) {
        meetingChunksMap[m.metadata.meetingId] = [];
      }
      meetingChunksMap[m.metadata.meetingId].push(m.metadata.chunkIndex);
    });

    // 4. Fetch meetings and matched transcript chunks
    const meetings = await Meeting.find({ _id: { $in: meetingIdsSorted } });
    // Map for quick lookup
    const meetingsMap = {};
    meetings.forEach((meeting) => {
      meetingsMap[meeting._id.toString()] = meeting;
    });

    const results = [];
    for (const meetingId of meetingIdsSorted) {
      const meeting = meetingsMap[meetingId];
      if (!meeting) continue;
      const transcript = await Transcript.findOne({ meeting_id: meeting._id });
      const chunkIndexes = meetingChunksMap[meetingId] || [];
      const matchedChunks = transcript
        ? chunkIndexes.map((idx) => transcript.content[idx])
        : [];
      results.push({
        _id: meeting._id,
        updatedAt: meeting.updatedAt,
        title: meeting.title,
        duration: meeting.duration,
        tags: meeting.tags,
        keypoints: meeting.keypoints,
        isSummarized: meeting.isSummarized,
        matchedChunks: matchedChunks,
        score: meetingScoreMap[meetingId],
      });
    }

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error searching meetings:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const fetchBulkMeetings = async (req, res) => {
  try {
    const { _id } = req.user;
    const { userQuery } = req.query;

    const allMeetings = await Meeting.find({ userId: _id }).sort({
      updatedAt: -1,
    });
    if (allMeetings.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "Meetings not found" });
    }

    res.json({
      success: true,
      data: allMeetings,
    });
  } catch (error) {
    console.log("Error geting meeting:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createNewMeeting = async (req, res) => {
  try {
    const { _id } = req.user;
    const newMeeting = new Meeting({ userId: _id, title: "New-meeting" });
    await newMeeting.save();
    res.status(200).json({
      success: true,
      meetId: newMeeting._id,
    });
  } catch (error) {
    console.log("error creating meeting : ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    const meetingId = req.params.id;
    console.log("deleting : ", meetingId);

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }

    await Transcript.deleteOne({ meeting_id: meetingId });
    await Summary.deleteOne({ meeting_id: meetingId });
    await Event.deleteOne({ meeting_id: meetingId });
    await Chat.deleteOne({ meeting_id: meetingId });
    await Meeting.findByIdAndDelete(meetingId);

    res.json({
      success: true,
      message: "Meeting and associated data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

async function getOrCreateChat(meeting_id) {
  let chat = await Chat.findOne({ meeting_id });
  if (!chat) {
    const meeting = await Meeting.findOne({ _id: meeting_id });
    chat = await Chat.create({ meeting_id });
    const starterMessage = `Hi! I'm here to help you with questions about "${meeting.title}". You can ask me about what was discussed, action items, decisions made, or any other details from this meeting.`;
    const initMessage = new Message({
      chat_id: chat._id,
      sender: "AI",
      content: starterMessage,
    });
    await initMessage.save();
  }
  return chat;
}

async function getChatMessages(chat_id) {
  return Message.find({ chat_id }).sort({ createdAt: 1 });
}

export const getMeetingChat = async (req, res) => {
  try {
    const { meetId } = req.params;
    const chat = await getOrCreateChat(meetId);
    const messages = await getChatMessages(chat._id);
    res.json({ success: true, chat_id: chat._id, messages });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "error getting chats",
    });
  }
};

export const getChatResponse = async (req, res) => {
  try {
    const { meetId } = req.params;
    const model = req.model;
    const { userMessage } = req.body;

    const relevantChunks = await getRelevantChunks(meetId, userMessage); // returns array of strings

    const context = relevantChunks.join("\n\n");

    const promptTemplate = fs.readFileSync("./prompts/prompt_chat.txt", "utf8");
    const prompt = `${promptTemplate}
  
  <transcript_context>
  ${context}
  </transcript_context>
  
  User question: ${userMessage}
  `;

    const aiResponse = await model.invoke([
      { role: "system", content: prompt },
    ]);
    console.log("RAW response : ", aiResponse.content);
    const responseContent = extractLLMResponse(aiResponse.content);
    console.log("chat response : ", responseContent);

    let messageData = {
      sender: "AI",
      content: responseContent.response || "",
    };

    if (responseContent.functions && responseContent.functions.length > 0) {
      if (responseContent.functions[0].name == "generatePDF") {
        const generatedFileURL = await generateMeetingPdfAndUpload(meetId);
        messageData.hasFile = true;
        messageData.fileURL = generatedFileURL;
      }
    }

    let chat = await getOrCreateChat(meetId);
    await Message.create({
      chat_id: chat._id,
      sender: "USER",
      content: userMessage,
    });
    const newMessage = await Message.create({
      chat_id: chat._id,
      ...messageData,
    });

    res.json({
      success: true,
      message: responseContent.response,
      hasFile: newMessage.hasFile || false,
      fileURL: newMessage.fileURL || "",
    });
  } catch (err) {
    console.log("eror geenrating response ", err.message);
    res.status(500).json({
      success: false,
      message: "error getting response",
    });
  }
};

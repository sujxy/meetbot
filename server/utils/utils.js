import axios from "axios";
import { z } from "zod";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeEmbeddings } from "@langchain/pinecone";
import dotenv from "dotenv";
import Transcript from "../models/transcript.js";
dotenv.config();

const CalendarEventSchema = z.object({
  name: z.literal("createCalendarEvent"),
  args: z.object({
    title: z.string().min(1, "Title cannot be empty"),
    description: z.string().min(1, "Description cannot be empty"),
    date: z.string().min(1, "Date cannot be empty"),
    startTime: z.string().min(1, "Start time cannot be empty"),
    endTime: z.string().min(1, "End time cannot be empty"),
  }),
});

const GeneratePDFSchema = z.object({
  name: z.literal("generatePDF"),
});

export function extractLLMResponse(response) {
  const titleMatch = response.match(/<title>(.*?)<\/title>/s);
  const summaryMatch = response.match(/<summary>(.*?)<\/summary>/s);
  const keypointsMatch = response.match(/<keypoints>\s*(.*?)\s*<\/keypoints>/s);
  const tagsMatch = response.match(/<tags>\s*(.*?)\s*<\/tags>/s);
  const responseMatch = response.match(/<response>(.*?)<\/response>/s);

  // Extract all <function>...</function> blocks
  const functionBlocks =
    response.match(/<function>([\s\S]*?)<\/function>/g) || [];
  const functions = functionBlocks
    .map((block) => {
      try {
        const json = block.replace(/<\/?function>/g, "").trim();
        try {
          return CalendarEventSchema.parse(JSON.parse(json));
        } catch {
          return GeneratePDFSchema.parse(JSON.parse(json));
        }
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);

  return {
    title: titleMatch ? titleMatch[1].trim() : "",
    summary: summaryMatch ? summaryMatch[1].trim() : "",
    keypoints: keypointsMatch ? keypointsMatch[1].split(",") : [],
    tags: tagsMatch ? tagsMatch[1].split(",") : [],
    response: responseMatch ? responseMatch[1].trim() : "",
    functions,
  };
}

export async function refreshAccessToken(refreshToken) {
  const params = new URLSearchParams();
  params.append("client_id", process.env.GOOGLE_CLIENT_ID);
  params.append("client_secret", process.env.GOOGLE_CLIENT_SECRET);
  params.append("refresh_token", refreshToken);
  params.append("grant_type", "refresh_token");

  const response = await axios.post(
    "https://oauth2.googleapis.com/token",
    params
  );
  console.log("New access token generated !");
  return response.data.access_token;
}

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.Index("meeting-transcripts-index");

export async function indexTranscript(transcript) {
  const embeddings = new PineconeEmbeddings({
    model: "multilingual-e5-large",
  });

  // Filter out empty/null/undefined chunks
  const validChunks = transcript.content
    .map((chunk, i) => ({ chunk, i }))
    .filter(
      ({ chunk }) => typeof chunk === "string" && chunk.trim().length > 0
    );

  const upsertPromises = validChunks.map(async ({ chunk, i }) => {
    const embedding = await embeddings.embedQuery(chunk);
    return index.upsert([
      {
        id: `${transcript._id.toString()}_${i}`,
        values: embedding,
        metadata: {
          meetingId: transcript.meeting_id.toString(),
          chunkIndex: i,
        },
      },
    ]);
  });

  await Promise.all(upsertPromises);
}

export async function getRelevantChunks(meetingId, query, topK = 10) {
  // 1. Embed the query
  const embeddings = new PineconeEmbeddings({
    model: "multilingual-e5-large",
  });
  const queryEmbedding = await embeddings.embedQuery(query);

  // 2. Query Pinecone for relevant chunks in this meeting
  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    filter: {
      meetingId: meetingId.toString(),
    },
  });

  // 3. Get chunk indexes from results
  const chunkIndexes = results.matches.map((m) => m.metadata.chunkIndex);

  // 4. Fetch the transcript document
  const transcript = await Transcript.findOne({ meeting_id: meetingId });

  if (!transcript) return [];

  // 5. Return the matched chunk texts
  return chunkIndexes.map((idx) => transcript.content[idx]).filter(Boolean);
}

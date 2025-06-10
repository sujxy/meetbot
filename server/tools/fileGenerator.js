import { Storage } from "@google-cloud/storage";
import Summary from "../models/summary.js";
import html_to_pdf from "html-pdf-node";
import dotenv from "dotenv";
dotenv.config();

export async function generateMeetingPdfAndUpload(meetingId) {
  const summary = await Summary.findOne({ meeting_id: meetingId });
  if (!summary || !summary.content) throw new Error("Summary not found");

  // Create a jsdom window for html-to-pdfmake
  let options = { format: "A4" };
  let fileData = { content: summary.content };

  const pdfBuffer = await new Promise((resolve, reject) => {
    html_to_pdf.generatePdf(fileData, options).then((pdfBuffer) => {
      resolve(pdfBuffer);
    });
  });

  const storage = new Storage({ keyFilename: process.env.GCP_KEYFILE });
  const bucket = storage.bucket(process.env.GCP_BUCKET);
  const filename = `meeting_${meetingId}_${Date.now()}.pdf`;
  const file = bucket.file(filename);
  await file.save(pdfBuffer, { contentType: "application/pdf" });

  return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}

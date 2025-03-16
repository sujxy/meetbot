import React from "react";

interface SummaryCardProps {
  meetingId: string;
  summary: string; // This will now contain HTML content
}

// const fetchSummary = async () => {
//   if (!meetingId) {
//     setError("Please enter a meeting ID.");
//     return;
//   }

//   setIsLoading(true);
//   setError("");

//   try {
//     const response = await axios.get(
//       `http://localhost:8000/summarize?meetId=${meetingId}`
//     );
//     setSummary(response.data.summary);
//   } catch (err) {
//     setError(
//       "Failed to fetch summary. Please check the meeting ID and try again."
//     );
//     console.error(err);
//   } finally {
//     setIsLoading(false);
//   }
// };

const SummaryCard: React.FC<SummaryCardProps> = ({ meetingId, summary }) => {
  return (
    <div className="bg-white p-6 rounded-lg my-4 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Meeting Summary</h2>
      <p className="text-gray-700 mb-2">
        <span className="font-bold">Meeting ID:</span> {meetingId}
      </p>
      <div
        className="text-gray-700"
        dangerouslySetInnerHTML={{ __html: summary }} // Render HTML content
      />
    </div>
  );
};

export default SummaryCard;

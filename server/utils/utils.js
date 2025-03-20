export function extractLLMResponse(response) {
  const titleMatch = response.match(/<title>(.*?)<\/title>/s);
  const summaryMatch = response.match(/<summary>(.*?)<\/summary>/s);
  const keypointsMatch = response.match(/<keypoints>\s*(.*?)\s*<\/keypoints>/s);
  const tagsMatch = response.match(/<tags>\s*(.*?)\s*<\/tags>/s);

  return {
    title: titleMatch ? titleMatch[1].trim() : "",
    summary: summaryMatch ? summaryMatch[1].trim() : "",
    keypoints: keypointsMatch ? keypointsMatch[1].split(",") : [],
    tags: tagsMatch ? tagsMatch[1].split(",") : [],
  };
}

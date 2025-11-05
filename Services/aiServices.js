import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyBip7sULJoCXfitgcPyWK20j5RIEYI6LtM";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const aiService = {
  async askAI(input, chatMessages) {
    const historyText = chatMessages
      .map(m => `${m.sender === "user" ? "Người dùng" : "AI"}: ${m.text}`)
      .join("\n");

    const prompt = `
Bạn là trợ lý thân thiện. Dưới đây là lịch sử trò chuyện:
${historyText}

Câu hỏi mới: "${input}"
Trả lời ngắn gọn, tự nhiên bằng tiếng Việt.
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  },

  // ✅ Giả lập Smart Reply bằng Gemini
  async suggestReplies(chatMessages) {
    const context = chatMessages
      .map(m => `${m.sender === "user" ? "Người dùng" : "AI"}: ${m.text}`)
      .join("\n");

    const prompt = `
Dưới đây là đoạn hội thoại:
${context}

Hãy gợi ý 3 phản hồi ngắn, tự nhiên, phù hợp với ngữ cảnh mà người dùng có thể chọn nhanh.
Trả về kết quả dạng JSON: ["...", "...", "..."]
`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const json = JSON.parse(text.match(/\[.*\]/s)?.[0] || "[]");
      return json.length ? json : ["Vâng", "Cảm ơn", "Cho mình thêm thông tin"];
    } catch {
      return ["Vâng", "Cảm ơn", "Cho mình thêm thông tin"];
    }
  },
};

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const analyzeReportAI = async (description, attachmentsText) => {
  try {
    const attachmentSection = attachmentsText && attachmentsText.trim().length > 0
      ? attachmentsText
      : "No attachments provided";

    const response = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a moderation AI for a bug bounty platform. You evaluate vulnerability reports for quality. You always respond with valid JSON only, no extra text.",
        },
        {
          role: "user",
          content: `Evaluate this vulnerability report. Check the description AND the attachment content separately and independently.
 
A good description MUST:
- Be at least 2 sentences long
- Contain specific technical details (e.g. endpoint names, attack vectors, error messages, steps to reproduce, impact)
 
FLAG the description if ANY of these are true:
- It is a single word or placeholder like "description", "test", "bug", "hello", "asdf"
- It is a single generic sentence with no technical specifics
- It is too short (less than 10 words)
- It contains no technical vocabulary related to security or vulnerabilities
 
FLAG the attachment if:
- It contains content completely unrelated to security or vulnerabilities
- It is marked as [EMPTY PDF CONTENT]
- It contains only gibberish, lorem ipsum, or placeholder text
 
DO NOT flag the attachment if:
- No attachment was provided
- The attachment type was unsupported (image/zip)
 
--- DESCRIPTION START ---
${description}
--- DESCRIPTION END ---
 
--- ATTACHMENT CONTENT START ---
${attachmentSection}
--- ATTACHMENT CONTENT END ---
 
Respond with ONLY this JSON, no other text:
{
  "flagged": true or false,
  "reasons": ["reason about description if flagged", "reason about attachment if flagged"]
}
If nothing is flagged, return: { "flagged": false, "reasons": [] }`,
        },
      ],
      temperature: 0,
    });

    const text = response.choices[0].message.content;
    console.log("Raw AI response:", text);

try {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return { flagged: false, reason: "Invalid AI response format" };
 
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        flagged: parsed.flagged ?? false,
        reason: Array.isArray(parsed.reasons) && parsed.reasons.length > 0
          ? parsed.reasons.join(" | ")
          : "No reason provided",
      };
    } catch {
      return { flagged: false, reason: "JSON parsing failed" };
    }
  } catch (err) {
    console.error("AI moderation error:", err.message);
    return { flagged: false, reason: "AI analysis failed" };
  }
};
 
module.exports = { analyzeReportAI };


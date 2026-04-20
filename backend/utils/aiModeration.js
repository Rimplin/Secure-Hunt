const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const askAIForJSON = async (prompt) => {
  const response = await openai.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You are a moderation AI for a cybersecurity bug bounty platform. You always respond with valid JSON only, with no extra text.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0,
  });

  const text = response.choices[0].message.content;
  console.log("Raw AI response:", text);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI response format invalid");
  }

  return JSON.parse(jsonMatch[0]);
};

const analyzeDescriptionAI = async (description) => {
  const prompt = `Evaluate ONLY the description of a vulnerability report.

Rules:
- Flag it if it is too vague, too generic, or lacks enough detail to understand the issue.
- Flag it if it does not mention any specific component, endpoint, behavior, or vulnerability type.
- Flag it if it contains only broad statements without explaining what happens, where, or how.
- Flag it if it is not actionable.
- Flag it if it needs more details
- A description can be plausible but still be flagged if it lacks sufficient detail or is not actionable.
- Only avoid flagging if the description provides enough information to understand and begin investigating the issue.- Do not call it unrelated to vulnerabilities unless it is clearly meaningless or nonsense.
- The reason must be concise and high-level.
- Do NOT enumerate missing elements (e.g., endpoint, behavior, vulnerability type).


Description:
${description}

Respond ONLY in JSON:
{
  "flagged": true/false,
  "reason": "short explanation"
}`;

  const parsed = await askAIForJSON(prompt);

  return {
    flagged: parsed.flagged === true,
    reason: parsed.reason || "",
  };
};

const analyzeAttachmentAI = async (attachmentsText) => {
  const attachmentSection =
    attachmentsText && attachmentsText.trim().length > 0
      ? attachmentsText
      : "No attachments provided";

  const prompt = `Evaluate ONLY the attachment content of a vulnerability report.

Rules:
- Ignore the description completely.
- Flag it if it contains no useful vulnerability-related information.
- Flag it if it is meaningless, irrelevant, unreadable, empty, or contains no extractable content.
- Flag it if it appears to be general content (e.g., notes, cheat sheets, articles, class material) rather than evidence of a vulnerability.
- Flag it if it does not contain logs, payloads, screenshots, traces, proof-of-concept material, reproduction details, or other technical evidence related to a vulnerability.
- Do not flag it if it provides any technical evidence supporting a vulnerability, even if incomplete.

DO NOT flag the attachment if:
- No attachment was provided
- The attachment type was unsupported (image/zip)

Attachment text:
${attachmentSection}

Respond ONLY in JSON:
{
  "flagged": true/false,
  "reason": "short explanation"
}`;

  const parsed = await askAIForJSON(prompt);

  return {
    flagged: parsed.flagged === true,
    reason: parsed.reason || "",
  };
};

const analyzeReportAI = async (description, attachmentsText) => {
  try {
    const descriptionResult = await analyzeDescriptionAI(description);
    const attachmentResult = await analyzeAttachmentAI(attachmentsText);

    const reasons = [];
    if (descriptionResult.flagged && descriptionResult.reason) {
      reasons.push(`Description: ${descriptionResult.reason}`);
    }
    if (attachmentResult.flagged && attachmentResult.reason) {
      reasons.push(`Attachment: ${attachmentResult.reason}`);
    }

    return {
      flagged: descriptionResult.flagged || attachmentResult.flagged,
      reason: reasons.length > 0 ? reasons.join(" | ") : "No reason provided",
      descriptionFlagged: descriptionResult.flagged,
      descriptionReason: descriptionResult.reason,
      attachmentFlagged: attachmentResult.flagged,
      attachmentReason: attachmentResult.reason,
    };
  } catch (err) {
    console.error("❌ AI error:", err);
    return {
      flagged: false,
      reason: "AI request failed",
      descriptionFlagged: false,
      descriptionReason: "",
      attachmentFlagged: false,
      attachmentReason: "",
    };
  }
};

module.exports = { analyzeReportAI };
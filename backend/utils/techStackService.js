const axios = require("axios");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Detect tech stack from a website URL.
 * @param {string} url - The website URL to analyze.
 * @returns {Promise<Object>} - The detected tech stack.
 */
const detectTechStack = async (url) => {
  try {
    // Ensure URL has protocol
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 5000,
    });

    const html = response.data;
    const headers = response.headers;

    // Extract head and also a chunk of the body to catch trailing scripts/structure
    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const headContent = headMatch ? headMatch[1] : "";
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1].substring(0, 3000) : html.substring(0, 3000);

    const relevantHtml = (headContent + "\n" + bodyContent)
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // Remove internal CSS
      .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "")   // Remove SVGs
      .replace(/<!--[\s\S]*?-->/g, "")               // Remove HTML comments
      .replace(/\s\s+/g, " ")                        // Collapse whitespace
      .substring(0, 6000);                          // Cap length to save tokens

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
       return {
         frontend: { type: "React", version: "18.x (Demo)" },
         backend: { type: "Node.js", version: "20.x (Demo)" },
         database: { type: "MongoDB", version: "7.x (Demo)" },
         webServer: { type: "Nginx", version: "1.24 (Demo)" },
         os: { type: "Linux", version: "Ubuntu 22.04 (Demo)" }
       };
    }

    const aiResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.1, // Slight temperature for probabilistic guessing
      messages: [
        {
          role: "system",
          content: "You are a web technology analyzer intercepting HTTP responses. You analyze HTTP headers and HTML DOM to return a structured JSON representing the tech stack. You always respond with valid JSON only.",
        },
        {
          role: "user",
          content: `Analyze the following HTTP headers and partial HTML content from ${url} and identify the technologies used.
Identify: Frontend Framework/Library, Backend (if detectable), Database (if detectable), Web Server, and Operating System.

Crucial Instructions:
- Use your internal knowledge. If the provided URL belongs to a well-known, established website and you know its primary tech stack with certainty (e.g., github.com uses Ruby on Rails), return the exact technologies directly (e.g., "Ruby on Rails").
- Look closely at script sources (e.g. "_next", "wp-content"), meta generator tags, HTTP headers (e.g. "x-powered-by", "server", "set-cookie"), class names (e.g. "React", "Vue"), and root elements context (e.g. <div id="root"> often implies React).
- If the exact technology is NOT explicitly public AND you do NOT already know it from your internal knowledge, do NOT use "Unknown". Instead, make a probabilistic assumption based on structural clues and prepend "Probable " (e.g., "Probable React", "Probable Django").
- Guess a realistic baseline version if typical (e.g., "18.x" for React) and prepend "Assumed ". If you know the exact version, just output the version directly.

HTTP Headers:
${JSON.stringify(headers, null, 2)}

HTML Partial Content:
${relevantHtml}

Respond in this exact JSON format:
{
  "frontend": { "type": "...", "version": "..." },
  "backend": { "type": "...", "version": "..." },
  "database": { "type": "...", "version": "..." },
  "webServer": { "type": "...", "version": "..." },
  "os": { "type": "...", "version": "..." }
}`,
        },
      ],
    });

    const rawText = aiResponse.choices[0]?.message?.content?.trim() ?? "{}";
    const jsonText = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Tech stack detection error:", error.message);
    // Return empty/unknown structure on failure
    return {
      frontend: { type: "Unknown", version: "Unknown" },
      backend: { type: "Unknown", version: "Unknown" },
      database: { type: "Unknown", version: "Unknown" },
      webServer: { type: "Unknown", version: "Unknown" },
      os: { type: "Unknown", version: "Unknown" }
    };
  }
};

module.exports = { detectTechStack };

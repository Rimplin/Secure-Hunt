const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Extract relevant fields from raw vulnerability results.
 * @param {Object} securityReport - Report from getProjectSecurityReport (has .details)
 * @returns {Array} - Flat list of simplified CVE objects
 */
const extractVulnerabilityData = (securityReport) => {
  const details = securityReport?.details || {};
  const flattened = [];

  for (const [, item] of Object.entries(details)) {
    if (!item.cves || item.cves.length === 0) continue;
    for (const cve of item.cves) {
      flattened.push({
        id: cve.id || "Unknown",
        description: cve.description || "No description",
        severity: cve.severity || "UNKNOWN",
        baseScore: cve.baseScore ?? "N/A",
      });
    }
  }

  return flattened;
};

/**
 * Generate AI testing guidance from vulnerability results using Groq.
 * @param {Object} securityReport - Full report from getProjectSecurityReport
 * @returns {Promise<Object>} - { recommendations: [...] }
 */
const generateTestingGuidance = async (securityReport) => {
  const vulns = extractVulnerabilityData(securityReport);

  if (vulns.length === 0) {
    return {
      recommendations: [],
      message: "No related vulnerabilities found.",
    };
  }

  const vulnSummary = vulns
    .map(
      (v) =>
        `- ${v.id} | Severity: ${v.severity} (Score: ${v.baseScore})\n  ${v.description}`
    )
    .join("\n\n");

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "You are a security assistant helping bug bounty hunters prepare for testing. You always respond with valid JSON only, no extra text or markdown.",
        },
        {
          role: "user",
          content: `Based ONLY on the following CVE vulnerability results, generate at most 4 high-level testing recommendations.

Rules:
- Use ONLY the vulnerability data provided. Do not invent technologies or assumptions.
- Do not provide exploit steps, payloads, or attack instructions.
- Keep each recommendation concise, practical, and useful for a bug bounty hunter.
- Respond with valid JSON only, no markdown, no extra text.

Vulnerability Results:
${vulnSummary}

Respond in this exact JSON format:
{
  "recommendations": [
    {
      "title": "short recommendation title",
      "priority": "high | medium | low",
      "reason": "brief explanation based on the vulnerability data"
    }
  ]
}`,
        },
      ],
    });

    const rawText = response.choices[0]?.message?.content?.trim() ?? "";

    // Strip markdown code fences if present
    const jsonText = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(jsonText);

    if (!Array.isArray(parsed.recommendations)) {
      throw new Error("Invalid response shape from Groq");
    }

    // Cap at 4 recommendations
    parsed.recommendations = parsed.recommendations.slice(0, 4);
    return parsed;
  } catch (err) {
    console.error("AI guidance generation error:", err.message);
    return {
      recommendations: [
        {
          title: "Manual Review Recommended",
          priority: "medium",
          reason:
            "Related vulnerability data was found, but automated recommendation generation is currently unavailable.",
        },
      ],
    };
  }
};

module.exports = { generateTestingGuidance };

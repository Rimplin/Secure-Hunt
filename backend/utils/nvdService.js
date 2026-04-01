const axios = require("axios");

const NVD_BASE_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0";

/**
 * Fetch CVEs for a given product and version.
 * @param {string} type - Product name (e.g., 'React', 'Node.js').
 * @param {string} version - Version string.
 * @returns {Promise<Array>} - Formatted vulnerability data.
 */
const fetchVulnerabilitiesForComponent = async (type, version) => {
  try {
    // We strictly use both type and version if available.
    // We also clean up the type name (e.g. "Node.js (Express)" -> "Express") 
    // to match NVD keywords better if it contains parentheses.
    let cleanType = type.split('(').pop().replace(')', '').trim();
    if (cleanType.toLowerCase() === "node.js") cleanType = "node.js"; // Keep node.js as is

    const query = version && version !== "Not specified" 
      ? `${cleanType} ${version}` 
      : cleanType;
    
    console.log(`📡 Fetching NVD data for: "${query}"`);
    
    const response = await axios.get(
      `${NVD_BASE_URL}?keywordSearch=${encodeURIComponent(query)}&resultsPerPage=5`
    );

    const vulnerabilities = response.data.vulnerabilities || [];
    const formatted = vulnerabilities.map((item) => {
      const cve = item.cve;
      const metrics = cve.metrics?.cvssMetricV31?.[0]?.cvssData || 
                      cve.metrics?.cvssMetricV30?.[0]?.cvssData || 
                      cve.metrics?.cvssMetricV2?.[0]?.cvssData || {};

      return {
        id: cve.id,
        description: cve.descriptions?.find((d) => d.lang === "en")?.value || "No description available",
        baseScore: metrics.baseScore || "N/A",
        severity: metrics.baseSeverity || "UNKNOWN",
        published: cve.published,
        link: `https://nvd.nist.gov/vuln/detail/${cve.id}`
      };
    });

    // Sort by most recent date
    return formatted.sort((a, b) => new Date(b.published) - new Date(a.published));
  } catch (error) {
    console.error(`Error fetching NVD data for ${type}:`, error.message);
    return []; // Return empty on error to allow other components to still load
  }
};

/**
 * Compile a security report for a full techStack.
 * @param {Object} techStack - Tech stack from Project model.
 * @returns {Promise<Object>} - Aggregated vulnerability report.
 */
const getProjectSecurityReport = async (techStack) => {
  const components = Object.keys(techStack).map((key) => ({
    name: key,
    type: techStack[key]?.type,
    version: techStack[key]?.version,
  })).filter(c => c.type && c.type !== "Not specified");

  const report = {};
  let totalCves = 0;
  let highSeverityCount = 0;

  // We should be careful with rate limits if techStack is large.
  // For now, we process them sequentially or with a slight delay.
  for (const component of components) {
    const cves = await fetchVulnerabilitiesForComponent(component.type, component.version);
    report[component.name] = {
      type: component.type,
      version: component.version,
      cves: cves,
      count: cves.length,
    };
    totalCves += cves.length;
    highSeverityCount += cves.filter(c => ["HIGH", "CRITICAL"].includes(c.severity)).length;
    
    // Add a larger delay for NVD rate limiting (5 req / 30s is very strict)
    // 6 seconds per request is safe without an API key.
    await new Promise(resolve => setTimeout(resolve, 6000));
  }

  // Calculate overall risk
  let riskLevel = "LOW";
  if (highSeverityCount > 0) riskLevel = "HIGH";
  else if (totalCves > 5) riskLevel = "MEDIUM";

  return {
    summary: {
      totalVulnerabilities: totalCves,
      highSeverityVulnerabilities: highSeverityCount,
      riskLevel,
      generatedAt: new Date().toISOString(),
    },
    details: report,
  };
};

module.exports = {
  getProjectSecurityReport,
};

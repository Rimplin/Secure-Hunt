const express = require("express");
const router = express.Router();
const axios = require("axios");

// GET CVEs by product name
// Proxying to NVD API
router.get("/:product", async (req, res) => {
  try {
    const { product } = req.params;
    if (!product) {
      return res.status(400).json({ message: "Product name is required" });
    }

    // Call NVD API
    // Keyword search finds CVEs associated with the product name
    const response = await axios.get(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(product)}&resultsPerPage=15`
    );

    // Simplify the response for the frontend
    const vulnerabilities = response.data.vulnerabilities || [];
    const formattedCVEs = vulnerabilities.map((item) => {
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
        lastModified: cve.lastModified,
      };
    });

    res.json({
      totalResults: response.data.totalResults,
      cves: formattedCVEs,
    });
  } catch (error) {
    console.error("Error fetching CVEs:", error.message);
    res.status(500).json({ message: "Error fetching vulnerabilities. NVD API might be rate limiting or down." });
  }
});

module.exports = router;

const { getProjectSecurityReport } = require("./utils/nvdService");
const mongoose = require("mongoose");
require("dotenv").config();

const mockTechStack = {
  frontend: { type: "React", version: "18.2.0" },
  backend: { type: "Node.js", version: "18.0.0" },
};

async function test() {
  console.log("🔍 Testing Security Report Generation...");
  try {
    const report = await getProjectSecurityReport(mockTechStack);
    console.log("✅ Report generated successfully!");
    console.log("Summary:", JSON.stringify(report.summary, null, 2));
    
    const components = Object.keys(report.details);
    console.log(`📊 Found data for ${components.length} components.`);
    
    components.forEach(comp => {
      console.log(`- ${comp}: ${report.details[comp].count} CVEs`);
    });

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
  process.exit();
}

test();

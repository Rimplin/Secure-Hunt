const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });
const Report = require("./models/Report");
const connectDB = require("./config/db");

async function run() {
  await connectDB();
  const all = await Report.find();
  console.log("Total Reports:", all.length);
  for (const r of all) {
    console.log(`- ID: ${r._id}, user: ${r.submittedBy}, status: ${r.status}, title: "${r.title}"`);
  }
  process.exit(0);
}
run();
//try
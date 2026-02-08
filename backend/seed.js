require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Project = require("./models/Project");

const projects = [
  {
    name: "API Penetration Testing",
    bounty: "$800",
    description: "Assess API endpoints for authentication and misconfigurations.",
    techStack: {
      frontend: { type: "React", version: "18.2.0" },
      backend: { type: "Node.js (Express)", version: "4.x" },
      database: { type: "MongoDB", version: "7.x" },
      webServer: { type: "Nginx", version: "1.24" },
      os: { type: "Ubuntu", version: "22.04" },
    },
  },
  {
    name: "Mobile App Vulnerability Scan",
    bounty: "$600",
    description: "Review mobile app security posture.",
    techStack: {
      frontend: { type: "React Native", version: "0.73" },
      backend: { type: "Node.js", version: "20.x" },
      database: { type: "PostgreSQL", version: "15" },
      webServer: { type: "Apache", version: "2.4" },
      os: { type: "Debian", version: "12" },
    },
  },
  {
    name: "Full-Stack Web Security Review",
    bounty: "$1200",
    description:
      "Comprehensive audit of frontend, backend, and infrastructure security.",
    techStack: {
      frontend: { type: "React", version: "18" },
      backend: { type: "Node.js (Express)", version: "4.x" },
      database: { type: "MongoDB", version: "7.x" },
      webServer: { type: "Nginx", version: "1.24" },
      os: { type: "Ubuntu", version: "22.04" },
    },
  },
];


const seed = async () => {
  await connectDB();

  await Project.deleteMany();
  await Project.insertMany(projects);

  console.log("🌱 Database seeded");
  process.exit();
};

seed();

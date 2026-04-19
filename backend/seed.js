require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const Project = require("./models/Project");
const User = require("./models/User");

const projects = [
  {
    name: "Testing",
    bounty: "$1000",
    description: "A dedicated Testing project for CI/CD checks.",
    techStack: {
      frontend: { type: "React", version: "18" },
      backend: { type: "Node", version: "20" },
      database: { type: "MongoDB", version: "6" },
      webServer: { type: "Nginx", version: "1.24" },
      os: { type: "Ubuntu", version: "22.04" },
    },
  },
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
];

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Project.deleteMany();
    await User.deleteMany();

    // Create Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456789", salt);

    const admin = await User.create({
      email: "administrator@hotmail.com",
      password: hashedPassword,
      role: "administrator",
      isVerified: true
    });

    const company = await User.create({
      email: "company@hotmail.com",
      password: hashedPassword,
      role: "company",
      isVerified: true
    });

    // Create Projects with owner
    const projectsWithOwner = projects.map(p => ({ ...p, owner: company._id }));
    await Project.insertMany(projectsWithOwner);

    console.log("🌱 Database seeded successfully with Users and Projects");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seed();

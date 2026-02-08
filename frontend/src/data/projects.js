// frontend/src/data/projects.js
// Sprint 1: mock data aligned with final schema (title, bounty, description, full tech stack)

export const projects = [
  {
    id: 1,
    name: "API Penetration Testing",
    bounty: "$800",
    description:
      "Assess API endpoints for authentication, authorization, input validation, and misconfigurations within the defined scope.",
    techStack: {
      frontend: { type: "React", version: "18.2.0" },
      backend: { type: "Node.js (Express)", version: "4.x" },
      database: { type: "MongoDB", version: "7.x" },
      webServer: { type: "Nginx", version: "1.24" },
      os: { type: "Ubuntu", version: "22.04" },
    },
  },
  {
    id: 2,
    name: "Mobile App Vulnerability Scan",
    bounty: "$600",
    description:
      "Review mobile app security posture focusing on authentication flows, storage practices, and common mobile misconfigurations.",
    techStack: {
      frontend: { type: "React Native", version: "0.73" },
      backend: { type: "Node.js", version: "20.x" },
      database: { type: "PostgreSQL", version: "15" },
      webServer: { type: "Apache", version: "2.4" },
      os: { type: "Debian", version: "12" },
    },
  },
  {
    id: 3,
    name: "Web App Security Audit",
    bounty: "$500",
    description:
      "Audit the web application for common weaknesses, focusing on access control, session handling, and input validation.",
    techStack: {
      frontend: { type: "Vue", version: "3.x" },
      backend: { type: "Django", version: "4.2" },
      database: { type: "MySQL", version: "8.0" },
      webServer: { type: "Nginx", version: "1.22" },
      os: { type: "Ubuntu", version: "20.04" },
    },
  },
  // Sprint 1: duplicates are fine; make them unique later if you want
  {
    id: 4,
    name: "API Penetration Testing",
    bounty: "$800",
    description:
      "Assess API endpoints for auth and access control issues, and validate input sanitization within scope.",
    techStack: {
      frontend: { type: "React", version: "18.2.0" },
      backend: { type: "Node.js (Express)", version: "4.x" },
      database: { type: "MongoDB", version: "7.x" },
      webServer: { type: "Nginx", version: "1.24" },
      os: { type: "Ubuntu", version: "22.04" },
    },
  },
  {
    id: 5,
    name: "Mobile App Vulnerability Scan",
    bounty: "$600",
    description:
      "Evaluate auth flows, local storage practices, and common mobile configuration issues.",
    techStack: {
      frontend: { type: "React Native", version: "0.73" },
      backend: { type: "Node.js", version: "20.x" },
      database: { type: "PostgreSQL", version: "15" },
      webServer: { type: "Apache", version: "2.4" },
      os: { type: "Debian", version: "12" },
    },
  },
  {
    id: 6,
    name: "Web App Security Audit",
    bounty: "$500",
    description:
      "Review sessions, access control, and input validation across the application.",
    techStack: {
      frontend: { type: "Vue", version: "3.x" },
      backend: { type: "Django", version: "4.2" },
      database: { type: "MySQL", version: "8.0" },
      webServer: { type: "Nginx", version: "1.22" },
      os: { type: "Ubuntu", version: "20.04" },
    },
  },
];

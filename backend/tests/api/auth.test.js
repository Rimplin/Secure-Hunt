process.env.GROQ_API_KEY = "test";
process.env.STRIPE_SECRET_KEY = "test_stripe_key";
process.env.JWT_SECRET = "test_jwt_secret";
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const app = require("../../app");
const User = require("../../models/User");

let mongoServer;

beforeAll(async () => {
  // Start the in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Connect Mongoose to the in-memory DB
  await mongoose.connect(uri);
});

afterAll(async () => {
  // Disconnect from the DB and stop the memory server
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear the users collection before each test
  await User.deleteMany({});
});

describe("Auth API", () => {
  describe("POST /api/auth/register", () => {
    it("should successfully register a new user", async () => {
      // Act
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "testuser@example.com",
          password: "password123",
          role: "hunter"
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.message).toBe("User created. Verify email.");

      // Verify the user was created in the database
      const user = await User.findOne({ email: "testuser@example.com" });
      expect(user).toBeTruthy();
      expect(user.email).toBe("testuser@example.com");
    });

    it("should return 400 if user already exists", async () => {
      // Arrange
      await User.create({
        email: "existing@example.com",
        password: "hashedpassword",
        role: "company"
      });

      // Act
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "existing@example.com",
          password: "newpassword123",
          role: "company"
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("User already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login user and return a cookie", async () => {
      // Arrange
      await request(app)
        .post("/api/auth/register")
        .send({
          email: "loginuser@example.com",
          password: "password123",
          role: "hunter"
        });

      // Act
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "loginuser@example.com",
          password: "password123"
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login successful");
      // Check for cookie
      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=/);
    });

    it("should return 400 for invalid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123"
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid credentials");
    });
  });
});

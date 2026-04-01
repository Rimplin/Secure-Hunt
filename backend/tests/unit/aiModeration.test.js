const mockCreate = jest.fn();

jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }));
});

const { analyzeReportAI } = require("../../utils/aiModeration");
const OpenAI = require("openai");

describe("AI Moderation Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return flagged: true when the AI flags the report", async () => {
    // Arrange
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: '{"flagged": true, "reasons": ["description is too short"]}',
          },
        },
      ],
    });

    // Act
    const result = await analyzeReportAI("short", "None");

    // Assert
    expect(result.flagged).toBe(true);
    expect(result.reason).toBe("description is too short");
  });

  it("should return flagged: false when the AI does not flag the report", async () => {
    // Arrange
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: '{"flagged": false, "reasons": []}',
          },
        },
      ],
    });

    // Act
    const result = await analyzeReportAI(
      "A very descriptive vulnerability report.",
      "POC attached."
    );

    // Assert
    expect(result.flagged).toBe(false);
    expect(result.reason).toBe("No reason provided");
  });

  it("should handle invalid JSON from AI gracefully", async () => {
    // Arrange
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: "This is not JSON",
          },
        },
      ],
    });

    // Act
    const result = await analyzeReportAI("test", "test");

    // Assert
    expect(result.flagged).toBe(false);
    expect(result.reason).toBe("Invalid AI response format");
  });
});

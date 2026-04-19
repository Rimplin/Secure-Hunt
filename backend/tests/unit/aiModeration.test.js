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

describe("AI Moderation Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return flagged: true when the AI flags the description only", async () => {
    mockCreate
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: '{"flagged": true, "reason": "lacks sufficient detail"}',
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: '{"flagged": false, "reason": ""}',
            },
          },
        ],
      });

    const result = await analyzeReportAI("short", "None");

    expect(result.flagged).toBe(true);
    expect(result.reason).toBe("Description: lacks sufficient detail");
    expect(result.descriptionFlagged).toBe(true);
    expect(result.attachmentFlagged).toBe(false);
  });

  it("should return flagged: false when neither description nor attachment is flagged", async () => {
    mockCreate
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: '{"flagged": false, "reason": ""}',
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: '{"flagged": false, "reason": ""}',
            },
          },
        ],
      });

    const result = await analyzeReportAI(
      "A descriptive vulnerability report with enough detail.",
      "POC attached."
    );

    expect(result.flagged).toBe(false);
    expect(result.reason).toBe("No reason provided");
    expect(result.descriptionFlagged).toBe(false);
    expect(result.attachmentFlagged).toBe(false);
  });

  it("should handle invalid JSON from AI gracefully", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: "This is not JSON",
          },
        },
      ],
    });

    const result = await analyzeReportAI("test", "test");

    expect(result.flagged).toBe(false);
    expect(result.reason).toBe("AI request failed");
  });
});
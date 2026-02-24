const mongoose = require("mongoose");

const stackItem = new mongoose.Schema({
  type: String,
  version: String,
});

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    bounty: { type: String, required: true },
    description: { type: String, required: true },

    techStack: {
      frontend: { type:Object },
      backend: { type:Object },
      database: { type:Object },
      webServer: { type:Object },
      os: { type:Object },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);

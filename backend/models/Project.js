const { Schema, model } = require("mongoose");

const stackItem = new Schema({
  type: String,
  version: String,
});

const projectSchema = new Schema(
  {
    name: { type: String, required: true },
    bounty: { type: String, required: true },
    description: { type: String, required: true },

    /*scope: { type:String, required:true },
    rules: { type:String, required:true },
    securityContext: { type:String, required:true },*/

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

module.exports = model("Project", projectSchema);
import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  versions: { type: [String], default: [] },
  adminKey: { type: String, required: true, default: () => Math.random().toString(36).slice(2) + Date.now().toString(36) }
});

// Ensure unique index only applies when adminKey exists
AdminSchema.index({ adminKey: 1 }, { unique: true, partialFilterExpression: { adminKey: { $type: "string" } } });

export default (mongoose.models.Admin as mongoose.Model<any>) || mongoose.model("Admin", AdminSchema);
  
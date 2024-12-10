import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required (from DB)"] },
    email: {
      type: String,
      required: [true, "Email ID is required (from DB)"],
      unique: true,
      match: [
        /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
        "Please provide a valid email address (from DB)",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required (from DB)"],
      minLength: [6, "Password should be 6 characters short"]
    },
    registeredAt: { type: Date },
    refreshToken: { type: String },
  },
  { versionKey: false }
);

const user = mongoose.model("users", userSchema);

export default { user };

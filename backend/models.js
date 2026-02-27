const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    type: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    belt: {
      type: String,
      enum: ["GBK", "BRANCA", "AZUL", "ROXA", "MARROM", "PRETA"],
      default: "BRANCA",
    },
    degrees: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    lastGraduation: {
      type: Date,
    },
    nextGraduation: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check-in Schema
const checkinSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    classId: {
      type: Number,
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected"],
      default: "pending",
    },
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    confirmedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
checkinSchema.index({ user: 1, date: -1 });
checkinSchema.index({ status: 1 });

// Class Schema (opcional - para gerenciar horários)
const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    weekdays: [
      {
        type: Number, // 0-6 (Domingo-Sábado)
        min: 0,
        max: 6,
      },
    ],
    level: {
      type: String,
      enum: ["GB1", "GB2", "GB3", "Kids", "All Levels"],
      required: true,
    },
    instructor: {
      type: String,
    },
    maxStudents: {
      type: Number,
      default: 30,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Export models
const User = mongoose.model("User", userSchema);
const Checkin = mongoose.model("Checkin", checkinSchema);
const Class = mongoose.model("Class", classSchema);

module.exports = {
  User,
  Checkin,
  Class,
};

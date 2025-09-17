const mongoose = require("mongoose");
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: true
  },
 institute: {
    type: String,
  },
 department : {
    type: String,
  }
  ,
  role: {
    type: String,
    enum: ["organization", "user"],
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: function () {
      return this.role === "user";
    },
  },
  lastActivity:{
    type: Boolean,
    default: false,
  },

  deviceInfo: {
    deviceId: String,
    deviceType: String,
    
    lastKnownLocation: {
      latitude: Number,
      longitude: Number,
      timestamp: Date,
    },
  },
  workingHours: {
    start: {
      type: String,
      default: "09:00",
    },
    end: {
      type: String,
      default: "17:00",
    },
  },
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
  refreshToken: String,
}, { timestamps: true });


// bcrypt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS, 10));
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
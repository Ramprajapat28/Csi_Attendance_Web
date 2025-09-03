const express = require("express");
const User = require("../models/user.models");
const Organization = require("../models/organization.models");
const jwt = require("jsonwebtoken");
const qrGenerator = require("../utils/qrGenarator");
const QRCode = require("../models/Qrcode.models");
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "2h", // ✅ Extended to 2 hours (was 15m)
  });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d", // ✅ Extended to 30 days (was 7d)
  });
  return { accessToken, refreshToken };
};

const register_orginization = async (req, res) => {
  try {
    const { email, password, name, organizationName } = req.body;
    if (!email || !password || !name || !organizationName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    console.log(req.body);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = new User({
      email,
      password,
      name,
      role: "organization",
    });

    await user.save();
    const organization = new Organization({
      name: organizationName,

      adminId: user._id,
    });

    await organization.save();

    user.organizationId = organization._id;
    await user.save();

    const checkInQR = await qrGenerator.generateQRCode(
      organization._id,
      organization.location
    );
    const checkInQRDoc = await QRCode.create({
      organizationId: organization._id,
      code: checkInQR.code,
      qrType: "check-in",
      qrImageData: checkInQR.qrCodeImage,
      active: true,
    });
    const checkOutQR = await qrGenerator.generateQRCode(
      organization._id,
      organization.location
    );
    const checkOutQRDoc = await QRCode.create({
      organizationId: organization._id,
      code: checkOutQR.code,
      qrType: "check-out",
      qrImageData: checkOutQR.qrCodeImage,
      active: true,
    });

    organization.checkInQRCodeId = checkInQRDoc._id;
    organization.checkOutQRCodeId = checkOutQRDoc._id;
    await organization.save();
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Organization registered successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      organization: {
        id: organization._id,
        name: organization.name,
      },
      accessToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const register_user = async (req, res) => {
  try {
    const { email, password, name, organizationCode } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    organization = await Organization.findOne({ name: organizationCode });
    if (!organization) {
      return res.status(400).json({ message: "Invalid organization code" });
    }
    const user = new User({
      email,
      password,
      name,
      role: "user",
      organizationId: organization._id,
    });

    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).populate("organizationId");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      organization: user.organizationId
        ? {
            id: user.organizationId._id,
            name: user.organizationId.name,
          }
        : null,
      accessToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, workingHours, password } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        password,
        workingHours,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const response = {
      ...user.toObject(),
      organization: user.organizationId || null,
    };

    res.json(response);
  } catch (error) {
    console.error("Update user profile error:", error);
    res.status(500).json({ message: "Failed to update user profile" });
  }
};

const viewProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("organizationId", "name")
      .select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const response = {
      ...user.toObject(),
      organization: user.organizationId || null,
    };

    res.json(response);
  } catch (error) {
    console.error("View profile error:", error);
    res.status(500).json({ message: "Failed to retrieve user profile" });
  }
};

const logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  register_orginization,
  register_user,
  login,
  logout,
  updateProfile,
  viewProfile,
};

const express = require("express");
const User = require("../models/user.models");
const Attendance = require("../models/Attendance.models");


const records = async (req, res) => {
  try {
    if (!req.user.organizationId) {
      return res.status(400).json({ message: "No organization associated with user" });
    }
    const { organizationId } = req.user;
    const { page = 1, limit = 20 } = req.query;
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }
    const records = await Attendance.find({ organizationId })
      .populate("userId", "name email")
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Attendance.countDocuments({ organizationId });
    res.json({
      records,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({
      message: "Failed to fetch attendance records",
      error: error.message,
    });
  }
};


const singleUser = async(req, res) => {
  try{
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "No user found"});
    }
    
    const singleUser = await User.findById(id);
    if (!singleUser){
      return res.status(404).json({ error: "User not found" });
    } 
    res.status(202).json(user);
  } catch(err){
    console.error("Error fetching singleUser:", err);
    res.status(500).json({ error: 'Server error'})
  }
}


module.exports ={
    records,
    singleUser
}
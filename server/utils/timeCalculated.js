const User = require("../models/user.models");
const Attendance = require("../models/Attendance.models");

const timeCalculated = async (userId , organizationId) => {
    try{
        const user = await User.findById(userId);
        if(!user){
            throw new Error("User not found");
        }
        workingHours = [];
        
    }
}
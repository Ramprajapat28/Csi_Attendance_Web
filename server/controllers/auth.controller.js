
require("dotenv").config();
const User = require("../models/user.models");
const Organization= require ("../models/organization.models");
const jwt = require("jsonwebtoken");
require("dotenv").config();


 const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  })
  return { accessToken, refreshToken };
};


const authController = {
  organizationRegistration: async (req,res)=> {

    const  { email, password, name, organizationName, address, location } =
        req.body;
        console.log(req.body)
      
          //all inputs are required
          if (!email || !password || !name || !organizationName || !address || !location) {
              return res.status(400).json({ message: "All fields are required" });
            }
            
    

        // checking if user exists 
      const existingUser = await User.findOne({ email });

      console.log(existingUser)
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }


      // creating new OrganizationUser
      const user = new User({
        email,
        password,
        name,
        role:"organization",
      });

      await user.save();


      // creating new orgainzation
      const organization = new Organization({
        name: organizationName,
        address,
        location,
       
        adminId: user._id,
      });

      await organization.save();

      user.organizationId = organization._id;
      await user.save();

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
  

    },
              

 registerUser: async (req,res) => {
   
         const {email,password,name,organizationCode}= req.body;


        //  checking for all details
        if(!email || !password || !name || !organizationCode){
           return res.status(400).json({message :"All the fields are required"});
        }
         
        // checking if user already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "User already exsits"});
         }
        
       const User = new User({
           
            name,
            email,
            password,
            role:"user",
            organizationId:organization._id,
       })
      
        await User.save();
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
        organization: {
          id: organization._id,
          name: organization.name,
        },
        accessToken,
      });


    },




    

    // login 
    login: async(req,res)=>{

        const {email,password}=req.body;
        
        const user = await User.findOne({ email });
         if (!user) {
           return res.status(400).json({ message: "Invalid credentials" });
         }
         
          const userMatch = await user.comparePassword(password);
      if (!userMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      user.lastLogin = new Date();
      await user.save();

    },


    // logout 
    logout:  async (req , res) => {
    try{
        res.clearCookie("refreshToken");
      res.json({ message: "Logged out successfully" });
    } catch(error){
        console.log("Error: ", error);
      res.status(500).json({ message: "Logout failed" });
    }  
}

}


module.exports = authController;
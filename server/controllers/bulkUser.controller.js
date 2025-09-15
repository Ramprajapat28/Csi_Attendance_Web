const xlsx = require("xlsx");
const User = require("../models/user.models");
const Organization = require("../models/organization.models");
const { sendMail } = require("../utils/mailer");
const jwt = require("jsonwebtoken");
const axios = require("axios");

// Enhanced bulk register with better error handling
const bulkRegisterUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "No Excel file uploaded" 
      });
    }

    // Get organization
    const orgId = req.user.organizationId;
    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({ 
        success: false,
        message: "Organization not found" 
      });
    }

    let jsonData;
    try {
      // Read Excel file from Cloudinary URL with timeout
      const response = await axios.get(req.file.path, {
        responseType: "arraybuffer",
        timeout: 30000, // 30 second timeout
        maxContentLength: 10 * 1024 * 1024, // 10MB limit
      });

      const buffer = Buffer.from(response.data);
      const workbook = xlsx.read(buffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      jsonData = xlsx.utils.sheet_to_json(worksheet);
    } catch (fileError) {
      console.error("File processing error:", fileError);
      return res.status(400).json({
        success: false,
        message: "Failed to process Excel file. Please check file format and size."
      });
    }

    if (!jsonData || jsonData.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Excel file is empty or has no valid data" 
      });
    }

    // Limit batch size to prevent memory issues
    if (jsonData.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Too many users. Please process in batches of 1000 or fewer."
      });
    }

    const results = {
      success: [],
      errors: [],
      duplicates: [],
      total: jsonData.length,
    };

    // Pre-check for existing emails to avoid duplicates
    const emailsInFile = jsonData.map(row => row.email?.toLowerCase()).filter(Boolean);
    const existingUsers = await User.find({ 
      email: { $in: emailsInFile } 
    }).select('email');
    
    const existingEmails = new Set(existingUsers.map(u => u.email));

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2; // Excel row number (starting from 2)

      try {
        // Validate required fields
        const { email, name, institute, department, password } = row;

        if (!email || !name || !institute || !department || !password) {
          results.errors.push({
            row: rowNumber,
            email: email || "N/A",
            error: "Missing required fields (email, name, institute, department, password)",
          });
          continue;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          results.errors.push({
            row: rowNumber,
            email: email,
            error: "Invalid email format",
          });
          continue;
        }

        const normalizedEmail = email.toLowerCase();

        // Check for duplicates
        if (existingEmails.has(normalizedEmail)) {
          results.duplicates.push({
            row: rowNumber,
            email: normalizedEmail,
            error: "User already exists",
          });
          continue;
        }

        // Create user
        const user = new User({
          email: normalizedEmail,
          password: password,
          name: name.trim(),
          role: "user",
          institute: institute.trim(),
          department: department.trim(),
          organizationId: organization._id,
        });

        await user.save();
        
        // Add to existing emails set to prevent duplicates within the file
        existingEmails.add(normalizedEmail);

        // Generate reset token for setting password
        const resetToken = jwt.sign(
          { userId: user._id },
          process.env.JWT_RESET_SECRET,
          { expiresIn: "24h" }
        );

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // Send welcome email (with error handling)
        try {
          await sendMail(
            user.email,
            "Welcome - Set Your Account Password",
            `<h2>Welcome to ${organization.name}</h2>
             <p>Your account has been created. Please set your password:</p>
             <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Set Password</a>
             <p>This link will expire in 24 hours.</p>`
          );
        } catch (emailError) {
          console.error("Email sending failed for:", user.email, emailError);
          // Don't fail the user creation, just log it
        }

        results.success.push({
          row: rowNumber,
          email: normalizedEmail,
          name: name.trim(),
          message: "User created successfully",
        });

      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        results.errors.push({
          row: rowNumber,
          email: row.email || "N/A",
          error: error.message,
        });
      }
    }

    // Return comprehensive results
    res.json({
      success: true,
      message: `Bulk registration completed. ${results.success.length} users created, ${results.errors.length} errors, ${results.duplicates.length} duplicates.`,
      summary: {
        total: results.total,
        successful: results.success.length,
        errors: results.errors.length,
        duplicates: results.duplicates.length,
      },
      results: results,
    });

  } catch (error) {
    console.error("Bulk registration error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to process bulk registration",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Enhanced template with better structure
const downloadTemplate = async (req, res) => {
  try {
    const templateData = [
      {
        email: "john.doe@example.com",
        name: "John Doe",
        institute: "Computer Science Institute",
        department: "Software Engineering",
        password: "TempPass123!",
      },
      {
        email: "jane.smith@example.com",
        name: "Jane Smith",
        institute: "Information Technology Institute",
        department: "Data Science",
        password: "TempPass456!",
      },
      {
        email: "mike.wilson@example.com",
        name: "Mike Wilson",
        institute: "Engineering Institute",
        department: "Web Development",
        password: "TempPass789!",
      }
    ];

    // Create workbook and worksheet
    const ws = xlsx.utils.json_to_sheet(templateData);
    
    // Set column widths
    const colWidths = [
      { wch: 25 }, // email
      { wch: 20 }, // name
      { wch: 30 }, // institute
      { wch: 20 }, // department
      { wch: 15 }, // password
    ];
    ws['!cols'] = colWidths;

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Users");

    // Generate buffer
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=bulk_user_registration_template.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);

  } catch (error) {
    console.error("Template download error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to generate template" 
    });
  }
};

module.exports = {
  bulkRegisterUsers,
  downloadTemplate,
};

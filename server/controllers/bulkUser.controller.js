const xlsx = require("xlsx");
const User = require("../models/user.models");
const Organization = require("../models/organization.models");
const { sendMail } = require("../utils/mailer");
const jwt = require("jsonwebtoken");
const axios = require("axios");

// Bulk register users from Excel
const bulkRegisterUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No Excel file uploaded" });
    }

    // Get organization
    const orgId = req.user.organizationId;
    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Read Excel file from Cloudinary URL
    const response = await axios.get(req.file.path, {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(response.data);
    const workbook = xlsx.read(buffer, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    const results = {
      success: [],
      errors: [],
      total: jsonData.length,
    };

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
            error:
              "Missing required fields (email, name, institute, department, password)",
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          results.errors.push({
            row: rowNumber,
            email: email,
            error: "User already exists",
          });
          continue;
        }

        // Create user
        const user = new User({
          email: email.toLowerCase(),
          password: password,
          name: name,
          role: "user",
          institute: institute,
          department: department,
          organizationId: organization._id,
        });

        await user.save();

        // Generate reset token for setting password
        const resetToken = jwt.sign(
          { userId: user._id },
          process.env.JWT_RESET_SECRET,
          { expiresIn: "24h" } // 24 hours for bulk registration
        );

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // Send welcome email
        try {
          await sendMail(
            user.email,
            "Welcome - Set Your Account Password",
            `
            <h2>Welcome to ${organization.name}!</h2>
            <p>Your account has been created. Please set your password:</p>
            <a href="${resetLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Set Password</a>
            <p>This link will expire in 24 hours.</p>
            `
          );
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
        }

        results.success.push({
          row: rowNumber,
          email: email,
          name: name,
          message: "User created successfully",
        });
      } catch (error) {
        results.errors.push({
          row: rowNumber,
          email: row.email || "N/A",
          error: error.message,
        });
      }
    }

    res.json({
      message: `Bulk registration completed. ${results.success.length} users created, ${results.errors.length} errors.`,
      results: results,
    });
  } catch (error) {
    console.error("Bulk registration error:", error);
    res.status(500).json({ message: "Failed to process bulk registration" });
  }
};

// Download Excel template
const downloadTemplate = async (req, res) => {
  try {
    const templateData = [
      {
        email: "user1@example.com",
        name: "John Doe",
        institute: "Computer Science Institute",
        department: "Software Engineering",
        password: "tempPassword123",
      },
      {
        email: "user2@example.com",
        name: "Jane Smith",
        institute: "Information Technology Institute",
        department: "Data Science",
        password: "tempPassword456",
      },
    ];

    // Create workbook and worksheet
    const ws = xlsx.utils.json_to_sheet(templateData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Users");

    // Generate buffer
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=user_registration_template.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Template download error:", error);
    res.status(500).json({ message: "Failed to generate template" });
  }
};

module.exports = {
  bulkRegisterUsers,
  downloadTemplate,
};

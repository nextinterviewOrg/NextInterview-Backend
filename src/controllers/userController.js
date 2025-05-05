const User = require("../Models/user-Model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Webhook } = require("svix");
const crypto = require("crypto");
const { buffer } = require("micro");
const { createClerkClient } = require("@clerk/backend");
const Questionnaire = require("../Models/questionnaireModel");
const connectDB = require("../config/dbConfig");
const multer = require('multer');
const path = require('path');
// Set up multer storage
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY_PROD,
});

exports.createUser = async function (req, res) {
  try {
    connectDB();
    const secret = process.env.CLERK_WEBHOOK_SECRET_KEY_PROD;
    // const secret="whsec_AlAVnrVNDBOjRfriagCwraben1BdsB+H"; //testing localhost
    // const secret = "whsec_KqKO9DM212HCtgsZIjxySJaaHUIcFbpF";
    const payload = JSON.stringify(req.body) || req.body;
    // const payload =req.body;
    console.log("payload", payload);
    console.log("secret", secret);
    const headers = req.headers;

    const wh = new Webhook(secret);
    const msg = wh.verify(payload, headers);
    // Handle the webhooks
    const eventType = msg.type;
    if (eventType === "user.created") {
      console.log(`User ${msg.data.id} was ${eventType}`);
      // console.log(attributes);
      const firstName = msg.data.first_name;

      const userExists = await User.findOne({
        user_email: msg.data.email_addresses[0].email_address,
      });
      if (userExists) {
        console.log("User already exists in database");
        return res.status(200).json({
          success: true,
          message: "User already exists in database",
        });
      }

      const user = new User({
        clerkUserId: msg.data.id,
        user_name:
          msg.data.first_name || "Anonymous",
        user_email: msg.data.email_addresses[0].email_address,
        user_phone_number: msg.data.phone_numbers[0]?.phone_number || null,
      });
      await user.save();
      console.log("User saved to database", user);
      // Add default public metadata
      if (!msg.data.public_metadata?.role == "admin") {


        const updatedUser = await clerkClient.users.updateUser(msg.data.id, {
          public_metadata: {
            role: "user", // Example: Set default role
            subscription: "free", // Example: Set default subscription type
          },
        });
      }
      console.log("Updated user with metadata:", updatedUser);
      console.log("User saved to database");
    } else if (eventType === "user.updated") {
      console.log("user updated ", msg);
      const user = await User.findOneAndUpdate(
        { clerkUserId: msg.data.id },
        {
          user_name:
            msg.data.first_name || "Anonymous",
          user_email: msg.data.email_addresses[0].email_address,
          user_phone_number: msg.data.phone_numbers[0]?.phone_number || null,
          user_role: msg.data.public_metadata.role || "user",
        }
      );
      console.log("event  ", user);
    } else if (eventType === "user.deleted") {
      console.log("user deleted ", msg);
      User.findOneAndDelete({ clerkUserId: msg.data.id }).then((user) => {
        if (user) {
          console.log("User deleted from database", user);
        }
      });
    } else {
      console.log("no Matched");
    }
    res.status(200).json({
      success: true,
      message: "Webhook received",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getUsers = async function (req, res) {
  try {
    const users = await User.find();
    console.log(users);
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.createUserProfile = async function (req, res) {
  try {
    console.log(req.body);
    const {
      user_id, // MongoDB _id of the user
      user_name,
      profile_pic,
      user_linkedin_profile_link,
      data_job_response,
      data_ai_job_response,
      data_experience_response,
      data_scheduled_interview_response,
      data_interview_schedule_response,
      data_interview_scheduled_response,
      data_past_interview_response,
      data_motive_response,
      profile_status,
      data_planned_interview_response,
    } = req.body;
    // Find the user by MongoDB _id
    const user = await User.findById(user_id);
    let questionnaire;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.user_data_questionnaire) {
      const QuestionnaireData = await Questionnaire.findById(
        user.user_data_questionnaire
      );

      QuestionnaireData.data_job_response =
        data_job_response || QuestionnaireData.data_job_response;
      QuestionnaireData.data_ai_job_response =
        data_ai_job_response || QuestionnaireData.data_ai_job_response;
      QuestionnaireData.data_experience_response =
        data_experience_response || QuestionnaireData.data_experience_response;
      QuestionnaireData.data_scheduled_interview_response =
        data_scheduled_interview_response ||
        QuestionnaireData.data_scheduled_interview_response;
      QuestionnaireData.data_interview_schedule_response =
        data_interview_schedule_response ||
        QuestionnaireData.data_interview_schedule_response;
      QuestionnaireData.data_interview_scheduled_response =
        data_interview_scheduled_response ||
        QuestionnaireData.data_interview_scheduled_response;
      QuestionnaireData.data_past_interview_response =
        data_past_interview_response ||
        QuestionnaireData.data_past_interview_response;
      QuestionnaireData.data_motive_response =
        data_motive_response || QuestionnaireData.data_motive_response;
      QuestionnaireData.data_planned_interview_response =
        data_planned_interview_response || QuestionnaireData.data_planned_interview_response;
      await QuestionnaireData.save();
      // Update user fields only if they are provided
      if (user_name) {
        user.user_name = user_name;
        const updatedUser = await clerkClient.users.updateUser(user.clerkUserId, {
          first_name: user_name,
        });
      }
      if (profile_pic) user.user_profile_pic = profile_pic;
      if (user_linkedin_profile_link) {
        user.user_linkedin_profile_link = user_linkedin_profile_link;
      }
      if (profile_status) user.profile_status = profile_status;
    } else {
      // Create a new Questionnaire document with only provided fields
      const questionnaireFields = {
        ...(data_job_response && { data_job_response }),
        ...(data_ai_job_response && { data_ai_job_response }),
        ...(data_experience_response && { data_experience_response }),
        ...(data_scheduled_interview_response !== undefined && {
          data_scheduled_interview_response,
        }),
        ...(data_interview_schedule_response && {
          data_interview_schedule_response,
        }),
        ...(data_interview_scheduled_response && {
          data_interview_scheduled_response,
        }),
        ...(data_past_interview_response && { data_past_interview_response }),
        ...(data_motive_response && { data_motive_response }),
        ...(data_planned_interview_response && { data_planned_interview_response }),
      };

      // Create and save the questionnaire only if there are fields to save

      if (Object.keys(questionnaireFields).length > 0) {
        questionnaire = new Questionnaire({
          ...questionnaireFields,
          user_id,
        });
        await questionnaire.save();


        user.user_data_questionnaire = questionnaire._id;
      }

      // Update user fields only if they are provided
      if (user_name) {
        user.user_name = user_name;
        const updatedUser = await clerkClient.users.updateUser(user.clerkUserId, {
          first_name: user_name,
        });
      }
      if (profile_pic) user.user_profile_pic = profile_pic;
      if (user_linkedin_profile_link) {
        user.user_linkedin_profile_link = user_linkedin_profile_link;
      }
      if (profile_status) user.profile_status = profile_status;
    }

    // Save the user document
    await user.save();

    res.status(200).json({
      success: true,
      message: "User profile and questionnaire updated successfully",
      data: {
        user,
        questionnaire: questionnaire || "No questionnaire data updated",
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getUserByClerkId = async function (req, res) {
  try {
    const { clerk_id } = req.params;
    const user = await User.findOne({ clerkUserId: clerk_id });
    const userData = await clerkClient.users.getUser(clerk_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      data: { user, clerkUserData: userData },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getUsers = async function (req, res) {
  try {
    const users = await User.find();
    const userData = await Promise.all(users.map(async (user) => {
      const response = await clerkClient.users.getUser(user.clerkUserId);
      return {
        userData: user,
        clerkUserData: response
      }

    }))

    res.status(200).json({
      success: true,
      data: { userData },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.lockUser = async function (req, res) {
  try {
    const { clerk_ids, startDate, endDate, reason, remarks } = req.body;
    clerk_ids.forEach(async (clerk_id) => {
      const response = await clerkClient.users.lockUser(clerk_id)
      const userData = await clerkClient.users.getUser(clerk_id)
      const user = await User.findOneAndUpdate(
        { clerkUserId: clerk_id },
        {
          $set: {
            user_Restriction_Data: {
              restrictionStart: startDate,
              restrictionEnd: endDate,
              reason: reason,
              remarks: remarks,
              restrictionStatus: true,
            }
          },
        }
      )
      const updatedUser = await clerkClient.users.updateUser(clerk_id, {
        private_metadata: {
          restrictionStart: startDate,
          restrictionEnd: endDate,
          reason: reason,
          remarks: remarks
        },
      });
    })

    res.status(200).json({
      success: true,
      message: "Users locked successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
exports.unlocklockUser = async function (req, res) {
  try {
    const { clerk_ids } = req.body;
    clerk_ids.forEach(async (clerk_id) => {
      const response = await clerkClient.users.unlockUser(clerk_id)
      const user = await User.findOneAndUpdate(
        { clerkUserId: clerk_id },
        {
          $set: {
            user_Restriction_Data: {
              restrictionStart: null,
              restrictionEnd: null,
              reason: null,
              remarks: null,
              restrictionStatus: false,
            }
          },
        }
      )
      const updatedUser = await clerkClient.users.updateUser(clerk_id, {
        private_metadata: null,
      });
    })

    res.status(200).json({
      success: true,
      message: "Users locked successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.resetPassword = async function (req, res) {
  try {
    const { clerk_id, oldPassword, newPassword } = req.body;
    const responseOldPassword = await clerkClient.users.verifyPassword({
      userId: clerk_id,
      password: oldPassword,
    })
    const responseNewPassword = await clerkClient.users.updateUser(clerk_id, {
      password: newPassword,
    });
    // console.log("responseNewPassword", responseNewPassword);

    // const response = await clerkClient.users.updateUser(clerk_id, {
    //   password: password,
    // });
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.log("heheheh", err);
    if (err.errors[0].code === "incorrect_password") {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const { clerk_id, user_name, user_profile_pic, user_Phone_number, user_email } = req.body;
    console.log("req.body", req.body);

    if (req.file) {

      const file = req.file;
      // Extract file data
      const { mimetype, originalname, buffer } = req.file;

      // Validate file type
      const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/gif']; // Add more if needed
      if (!allowedMimeTypes.includes(mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only image files are allowed.',
        });
      }

      console.log(`File received: ${originalname}, Type: ${mimetype}`);

      // Create the params object to send to Clerk API
      const fileBits = [file.buffer];
      const fileName = file.originalname;
      const fileType = file.mimetype;
      const fileObject = new File(fileBits, fileName, { type: fileType });
      const params = {
        file: fileObject,
      };
      console.log("params", params);

      // Call Clerk API to update user profile image
      const response = await clerkClient.users.updateUserProfileImage(clerk_id, params);
    }

    const responseNewPassword = await clerkClient.users.updateUser(clerk_id, {
      firstName: user_name,
      phoneNumber: user_Phone_number,
      emailAddress: user_email,
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: responseNewPassword
    });
  } catch (err) {
    console.log("Error updating user:", err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
exports.getUserQuestionariesByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Questionnaire.findOne({ user_id: id }).populate("user_id  data_past_interview_response.company_Name data_past_interview_response.designation data_past_interview_response.topics");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}


exports.addPastInterview = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { date_attended, company_Name, designation, topics, what_went_well, what_went_bad } = req.body;
    const user = await Questionnaire.findOne({ user_id: user_id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    user.data_past_interview_response.push({ date_attended, company_Name, designation, topics, what_went_well, what_went_bad });
    await user.save();
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



// Function to get user details by session ID
exports.getUserIdBySession = async (req, res) => {
  const { sessionId } = req.body;  // Get the session ID from request body
  console.log("Received sessionId:", sessionId);

  if (!sessionId) {
    return res.status(400).json({ success: false, message: "Session ID is required" });
  }

  try {
    // Fetch the session using the session ID
    const session = await clerkClient.sessions.getSession(sessionId);
    console.log("Session retrieved:", session);

    // Retrieve the userId from the session
    const userId = session.userId;

    // Return the userId in the response
    return res.status(200).json({
      success: true,
      message: "User ID retrieved successfully",
      userId: userId
    });

  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching user details by session ID:", error);

    // Check if the error is a Clerk API error and log its details
    if (error.response) {
      console.error("Clerk API Error:", error.response.data);
    }

    return res.status(500).json({
      success: false,
      message: "Error fetching user details",
      error: error.message,  // Include the error message for debugging
    });
  }
};

exports.createAdmins = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    connectDB();
    const secret = process.env.CLERK_WEBHOOK_SECRET_KEY_PROD;
    const user = await clerkClient.users.createUser({
      emailAddress: [email],
      password: password,

      firstName: name,  // optional

      publicMetadata: {
        // Add custom public metadata
        role: 'admin',
        signupSource: 'backend'
      }
    });

    return res.status(200).json({
      success: true,
      message: "Admin created successfully",
      data: user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
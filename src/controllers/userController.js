const User = require("../Models/user-Model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Webhook } = require("svix");
const crypto = require("crypto");
const { buffer } = require("micro");
const { createClerkClient } = require("@clerk/backend");
const Questionnaire = require("../Models/questionnaireModel");
const connectDB = require("../config/dbConfig");

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

exports.createUser = async function (req, res) {
  try {
    connectDB();
    const secret = process.env.CLERK_WEBHOOK_SECRET_KEY;
    // const secret="whsec_AlAVnrVNDBOjRfriagCwraben1BdsB+H"; //testing localhost
    // const secret = "whsec_KqKO9DM212HCtgsZIjxySJaaHUIcFbpF";
    const payload = JSON.stringify(req.body) || req.body;
    // const payload =req.body;
    console.log("payload", payload);
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
          msg.data.first_name + " " + msg.data.last_name || "Anonymous",
        user_email: msg.data.email_addresses[0].email_address,
        user_phone_number: msg.data.phone_numbers[0]?.phone_number || null,
      });
      await user.save();
      // Add default public metadata
      const updatedUser = await clerkClient.users.updateUser(msg.data.id, {
        public_metadata: {
          role: "user", // Example: Set default role
          subscription: "free", // Example: Set default subscription type
        },
      });
      console.log("Updated user with metadata:", updatedUser);
      console.log("User saved to database");
    } else if (eventType === "user.updated") {
      console.log("user updated ", msg);
      const user = await User.findOneAndUpdate(
        { clerkUserId: msg.data.id },
        {
          user_name:
            msg.data.first_name + " " + msg.data.last_name || "Anonymous",
          user_email: msg.data.email_addresses[0].email_address,
          user_phone_number: msg.data.phone_numbers[0]?.phone_number || null,
          user_role: msg.data.public_metadata.role,
        }
      );
      console.log("event  ", user);
    } else if (eventType === "user.deleted") {
      console.log("user deleted ", msg);
      User.findOneAndDelete({ clerkUserId: msg.data.id }).then((user) => {
        if (user) {
          console.log("User deleted from database");
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
      if (user_name) user.user_name = user_name;
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
      if (user_name) user.user_name = user_name;
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
};

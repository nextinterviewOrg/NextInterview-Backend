const express = require("express");
const router = express.Router();
const { 
  createUser, 
  getUsers, 
  createUserProfile, 
  getUserByClerkId, 
  lockUser, 
  unlocklockUser, 
  resetPassword, 
  updateUser, 
  getUserQuestionariesByUserId, 
  addPastInterview,
  deletePastInterview, 
  getUserIdBySession, 
  createAdmins, 
  deleteAdmins,
  getAllAdmins, 
  updatePastInterview 
} = require("../controllers/userController");
const bodyParser = require('body-parser');
const authorizeRole = require('../middleware/authorizeRole');
const { requireAuth } = require('@clerk/express');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads with increased limits
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2046 * 1024 * 1024, // 2046MB for files
    fieldSize: 2046 * 1024 * 1024 // 2046MB for fields
  }
});

// Configure body-parser with increased limit (2046MB)
const jsonParser = bodyParser.json({ limit: '2046mb' });
const urlencodedParser = bodyParser.urlencoded({ extended: true, limit: '2046mb' });
const rawParser = bodyParser.raw({ type: 'application/json', limit: '2046mb' });

// Apply the increased limit to all routes
router.use(jsonParser);
router.use(urlencodedParser);
router.use(rawParser);

// Routes
router.post("/createUser", rawParser, createUser);
router.get("/getUsers", getUsers);
router.post("/updateProfile", jsonParser, createUserProfile);
router.get("/getUserByClerk/:clerk_id", getUserByClerkId);
router.post("/restrictUser", jsonParser, lockUser);
router.post("/unrestrictUser", jsonParser, unlocklockUser);
router.post("/resetPassword", jsonParser, resetPassword);
router.post("/updateUser", upload.single('user_profile_pic'), updateUser);
router.get("/userQuationaries/:id", getUserQuestionariesByUserId);
router.post("/updateUser/addPastInterview/:user_id", jsonParser, addPastInterview);
router.delete("/updateUser/:user_id/past-interviews/:interview_id", deletePastInterview);
router.put("/updatePastinterview/:user_id/past-interviews/:interview_id", jsonParser, updatePastInterview);
router.post("/getUserBySessionId", jsonParser, getUserIdBySession);
router.post("/createAdmins", jsonParser, createAdmins);
router.delete("/deleteUser/", jsonParser, deleteAdmins);
router.get("/getAdmins", getAllAdmins);

module.exports = router;
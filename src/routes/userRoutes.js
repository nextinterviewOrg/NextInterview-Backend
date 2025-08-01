const e = require("express");
const express = require("express");
const router = express.Router();
const { createUser, getUsers, createUserProfile, getUserByClerkId, lockUser, unlocklockUser, resetPassword, updateUser, getUserQuestionariesByUserId, addPastInterview,deletePastInterview, getUserIdBySession, createAdmins, deleteAdmins,getAllAdmins } = require("../controllers/userController");
const bodyParser = require('body-parser');
// const { ClerkExpressWithAuth } =require ('@clerk/clerk-sdk-node')
const authorizeRole = require('../middleware/authorizeRole');
const { requireAuth } = require('@clerk/express');
const multer = require('multer');
const path = require('path');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/createUser", bodyParser.raw({ type: 'application/json' }), createUser);
// router.get("/getUsers",  ClerkExpressWithAuth(),getUsers);
// requireAuth({ signInUrl: '/' })
router.get("/getUsers", getUsers);
router.post("/updateProfile", createUserProfile);
router.get("/getUserByClerk/:clerk_id", getUserByClerkId);
router.post("/restrictUser", lockUser);
router.post("/unrestrictUser", unlocklockUser);
router.post("/resetPassword", resetPassword);
router.post("/updateUser", upload.single('user_profile_pic'), updateUser);
router.get("/userQuationaries/:id", getUserQuestionariesByUserId);
router.post("/updateUser/addPastInterview/:user_id", addPastInterview);
router.delete("/updateUser/:user_id/past-interviews/:interview_id", deletePastInterview);
router.post("/getUserBySessionId", getUserIdBySession);
router.post("/createAdmins", createAdmins);
router.delete("/deleteUser/", deleteAdmins);
router.get("/getAdmins", getAllAdmins);
module.exports = router;
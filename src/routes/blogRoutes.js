const express = require("express");
const router = express.Router();

const BlogController = require("../controllers/blogController");

router.post("/createBlog", BlogController.createBlog);
router.get("/getAllBlogs", BlogController.getAllBlogs);
router.delete("/deleteBlog/:id", BlogController.deleteBlog);

module.exports = router;
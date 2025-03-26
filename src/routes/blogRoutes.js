const express = require("express");
const router = express.Router();

const BlogController = require("../controllers/blogController");

router.post("/createBlog", BlogController.createBlog);
router.get("/getAllBlogs", BlogController.getAllBlogs);
router.delete("/deleteBlog/:id", BlogController.deleteBlog);
router.put("/updateBlog/:id", BlogController.updateBlogById);
router.get("/getBlogById/:id", BlogController.getBlogById);

module.exports = router;
const Blog = require("../Models/blogModel");

 const createBlog = async (req, res) => {
    try {
        const { blog_title, blog_description, blog_image } = req.body;
        const blog = new Blog({ blog_title, blog_description, blog_image });
        await blog.save();
        res.status(201).json({ message: "Blog created successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error creating blog" });
            }
            
}

const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.status(200).json(blogs);
        } catch (error) {
            res.status(500).json({ message: "Error fetching blogs" });
            }
            
}

const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        await Blog.findByIdAndDelete(id);
        res.status(200).json({ message: "Blog deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting blog" });
            }
            
}

module.exports = { createBlog,
    getAllBlogs,
    deleteBlog
 };
const Blog = require("../Models/blogModel");

const createBlog = async (req, res) => {
    try {
        const { title, content, image } = req.body;
        const blog = new Blog({ blog_title: title, blog_description: content, blog_image: image });
        const savedBlog = await blog.save();
        res.status(201).json({
            message: "Blog created successfully",
            blog: savedBlog
        });
    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.status(500).json({ message: "Error creating blog", error: error.message });
    }
};


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

const updateBlogById = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, image } = req.body;
  
      const updatedBlog = await Blog.findByIdAndUpdate(
        id,
        { blog_title: title, blog_description: content, blog_image: image },
        { new: true }
      );
  
      res.status(200).json(updatedBlog);
    } catch (error) {
      res.status(500).json({ message: "Error updating blog" });
    }
  };

  const getBlogById = async (req, res) => {
    try {
      const { id } = req.params;
      const blog = await Blog.findById(id);
      res.status(200).json(blog);
    } catch (error) {
      res.status(500).json({ message: "Error fetching blog" });
    }
  };
  

module.exports = {
    createBlog,
    getAllBlogs,
    deleteBlog,
    updateBlogById,
    getBlogById
};
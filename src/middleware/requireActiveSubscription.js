const User = require("../Models/user-Model");

module.exports = async (req, res, next) => {
  try {
    // Get user ID from request (assuming it's passed in req.body.userId or req.params.userId)
    const userId = req.body.userId || req.params.userId || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    // Find user in database
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Check if user has active subscription
    if (user.subscription_status !== "active") {
      return res.status(403).json({ 
        success: false, 
        message: "Active subscription required to access this feature",
        subscription_status: user.subscription_status,
        required_status: "active"
      });
    }

    // Check if subscription has expired
    if (user.subscription_end && new Date() > new Date(user.subscription_end)) {
      return res.status(403).json({ 
        success: false, 
        message: "Subscription has expired",
        subscription_status: user.subscription_status,
        subscription_end: user.subscription_end
      });
    }

    // Add user info to request for use in controllers
    req.user = user;
    next();

  } catch (error) {
    console.error("Subscription middleware error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

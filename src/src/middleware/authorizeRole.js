// src/middlewares/authorizeRole.js
const { createClerkClient } = require('@clerk/backend')
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
module.exports = (requiredRole) => {
    return async (req, res, next) => {
        console.log(req);
        const userId = req.auth.userId;
        const user = await clerkClient.users.getUser(userId);
        const userRole = user.publicMetadata.role;
 
        if (userRole !== requiredRole) {
            return res
                .status(403)
                .json({ error: "Forbidden: Insufficient permissions" });
        }
        res.status(200);
 
        next();
    };
};
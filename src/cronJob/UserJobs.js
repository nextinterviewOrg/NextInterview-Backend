const { removeExpiredRestrictions } = require("../jobs/userRestrictionJobs");
exports.unrestrictUser = async () => {

    try {
        connectDB();
        const restrictedUser= await removeExpiredRestrictions();
        res.status(200).json({
            success: true,
            message: "Users removed successfully",
        });
    } catch (error) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to remove users",
            error: err.message,
        });
    }
} 
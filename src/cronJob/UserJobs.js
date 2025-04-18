const { removeExpiredRestrictions } = require("../jobs/userRestrictionJobs");
const connectDB = require("../config/dbConfig");
exports.unrestrictUser = async () => {

    try {
        connectDB();
        const restrictedUser= await removeExpiredRestrictions();
        // res.status(200).json({
        //     success: true,
        //     message: "Users removed successfully",
        // });
    } catch (error) {
        console.error(error);
        // res.status(500).json({
        //     success: false,
        //     message: "Failed to remove users",
        //     error: error.message,
        // });
    }
} 
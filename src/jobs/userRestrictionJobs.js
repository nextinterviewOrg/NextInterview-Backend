const User = require("../Models/user-Model");
const { createClerkClient } = require("@clerk/backend");
const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

// Function to check and remove expired restrictions
exports.removeExpiredRestrictions = async () => {
    console.log("Checking for expired user restrictions...");

    // Get all users from Clerk
    const users = await clerkClient.users.getUserList();
    // console.log(`Found ${users.length} users.`,users);

    for (const user of users.data) {
        const { restrictionEnd } = user.privateMetadata;

        if (restrictionEnd) {
            const now = new Date();
            const end = new Date(restrictionEnd);

            if (now > end) {
                // Remove restriction
                await clerkClient.users.updateUserMetadata(user.id, {
                    privateMetadata: {
                        restrictionStart: null,
                        restrictionEnd: null,
                        reason: null,
                        remarks: null,
                    },
                });

                const updatedUser = await User.findOneAndUpdate({ clerkUserId: user.id },
                    {
                        $set: {
                            user_Restriction_Data: {
                                restrictionStart: null,
                                restrictionEnd: null,
                                reason: null,
                                remarks: null,
                                restrictionStatus: false,
                            }
                        },
                    }
                );

                console.log(`User ${user.id} restriction removed.`);
            }
        }
    }
};
const SupportQuery = require("../Models/supportQueryModel");

const createSupportQuery = async (req, res) => {
    const { user_id,priority, category, status, query_description } = req.body;
    const supportQuery = new SupportQuery({
        user_id,
        category,
        status,
        query_description,
        priority,
    });
    await supportQuery.save();
    res.send(supportQuery);
};

const getSupportQueryById = async (req, res) => {
    const { id } = req.params;
    const supportQuery = await SupportQuery.findById(id).populate("user_id");
    res.send(supportQuery);
};

const updateSupportQuery = async (req, res) => {
    const { id } = req.params;
    const { status, communicationLog } = req.body; // We only need status and communicationLog for updates

    try {
        // Update the support query with the new status and add a log entry
        const supportQuery = await SupportQuery.findByIdAndUpdate(
            id,
            {
                status,  // Update the query status (e.g., 'closed', 'read')
                $push: { communicationLog },  // Push the new communication log
                closed_on: status === 'solved' ? new Date() : null,  // Set closed_on date if query is closed
            },
            { new: true }  // Return the updated document
        );

        if (!supportQuery) {
            return res.status(404).send({ message: "Query not found" });
        }

        res.send(supportQuery);
    } catch (err) {
        console.error("Error updating query:", err);
        res.status(500).send({ message: "Failed to update query" });
    }
};


const getAllSupportQuery = async (req, res) => {
try{
    const supportQuery = await SupportQuery.find().populate("user_id");
    res.send({message:"success", data:supportQuery});
} catch (error) {
    res.status(500).json({ error: error.message });
}
};
const getSupportQueryStats = async (req, res) => {
    try {
        const totalQueries = await SupportQuery.countDocuments();
        const solvedQueries = await SupportQuery.countDocuments({ status: "solved" });
        const openQueries = totalQueries - solvedQueries;

        // Fetch all solved queries and calculate total time taken
        const solvedQueriesData = await SupportQuery.find({ status: "solved" }).select("submitted_on closed_on");

        let totalTimeInHours = 0;

        solvedQueriesData.forEach(query => {
            if (query.submitted_on && query.closed_on) {
                const timeDifference = (new Date(query.closed_on) - new Date(query.submitted_on)) / (1000 * 60 * 60); // Convert to hours
                totalTimeInHours += timeDifference;
            }
        });

        // Calculate the average time taken for all solved queries
        const avgTimeInHours = solvedQueries > 0 ? (totalTimeInHours / solvedQueries) : 0;

        // Convert hours to days if >= 24
        let avgTimeToSolve;
        if (avgTimeInHours >= 24) {
            const days = Math.floor(avgTimeInHours / 24);
            const remainingHours = Math.round(avgTimeInHours % 24);
            avgTimeToSolve = `${days} day${days > 1 ? 's' : ''} ${remainingHours} hr${remainingHours > 1 ? 's' : ''}`;
        } else {
            avgTimeToSolve = `${Math.round(avgTimeInHours)} hr${Math.round(avgTimeInHours) !== 1 ? 's' : ''}`;
        }

        res.json({
            message: "Support query statistics",
            data: {
                totalQueries,
                openQueries,
                solvedQueries,
                avgTimeToSolve,
            },
        });
    } catch (error) {
        console.error("Error fetching support query stats:", error);
        res.status(500).json({ message: "Failed to fetch statistics", error: error.message });
    }
};


const addAdminMessageToSupportQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required." });
    }

    const query = await SupportQuery.findById(id);
    if (!query) {
      return res.status(404).json({ message: "Support query not found." });
    }

    // Add admin message to the communication log
    query.communicationLog.push({
      date: new Date(),
      message: message,
    });

    // Optionally update status
    query.status = "answered";

    await query.save();

    res.status(200).json({
      message: "Admin response added to communication log.",
      data: query,
    });
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
    createSupportQuery,
    getSupportQueryById,
    updateSupportQuery,
    getAllSupportQuery,
    getSupportQueryStats,
    addAdminMessageToSupportQuery
};
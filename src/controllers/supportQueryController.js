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

// Utility function to format communication log with proper names
const formatCommunicationLog = (communicationLog) => {
    return communicationLog.map(log => {
        let fromName = 'Unknown';
        let toName = 'Unknown';

        if (log.from === "admin") {
            fromName = "Admin";
        } else if (log.from && typeof log.from === 'object') {
            fromName = log.from.name || log.from.username || log.from.email || 'User';
        }

        if (log.to === "admin") {
            toName = "Admin";
        } else if (log.to && typeof log.to === 'object') {
            toName = log.to.name || log.to.username || log.to.email || 'User';
        }

        return {
            date: log.date,
            from: fromName,
            to: toName,
            message: log.message
        };
    });
};


// Send message from admin to user
const sendMessageFromAdmin = async (req, res) => {
    try {
        const { queryId } = req.params;
        const { message } = req.body;

        // Populate user_id to get user details
        const supportQuery = await SupportQuery.findById(queryId).populate('user_id', 'username name email');
        
        if (!supportQuery) {
            return res.status(404).json({ message: "Support query not found" });
        }

        // Store admin as string and user as ObjectId reference
        supportQuery.communicationLog.push({
            from: "admin",              // Static string for admin
            to: supportQuery.user_id._id, // Store user ObjectId reference
            message: message,
        });

        if (supportQuery.status === "closed") {
            supportQuery.status = "reopened";
        }

        await supportQuery.save();

        // Populate the communication log for response
        const populatedQuery = await SupportQuery.findById(queryId)
            .populate('user_id', 'username name email')
            .populate('communicationLog.to', 'username name email');

        res.status(200).json({
            message: "Admin message sent successfully",
            supportQuery: populatedQuery
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Send message from user to admin
const sendMessageFromUser = async (req, res) => {
  try {
    const { queryId } = req.params;
    const { message } = req.body;

    const supportQuery = await SupportQuery.findById(queryId);
    if (!supportQuery) {
      return res.status(404).json({ message: "Support query not found" });
    }

    const newMessage = {
      from: "user",
      to: "admin",
      message,
      date: new Date()
    };

    supportQuery.communicationLog.push(newMessage);
    await supportQuery.save();

    res.status(200).json({
      message: "Message saved successfully",
      data: newMessage, // ✅ return only the new message
      queryId: supportQuery._id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};


// Get chat log for a specific support query
const getChatLog = async (req, res) => {
    try {
        const { queryId } = req.params;
        
        const supportQuery = await SupportQuery.findById(queryId)
            .populate("user_id", "name email username")
            .populate("communicationLog.from", "name email username")
            .populate("communicationLog.to", "name email username");
        
        if (!supportQuery) {
            return res.status(404).json({ message: "Support query not found" });
        }

        // Format the communication log for better readability
        const formattedLog = supportQuery.communicationLog.map(log => ({
            date: log.date,
            from: log.from === "admin" ? "admin" : 
                 (log.from && (log.from.name || log.from.username || log.from.email)) || 'User',
            to: log.to === "admin" ? "admin" : 
               (log.to && (log.to.name || log.to.username || log.to.email)) || 'User',
            message: log.message
        }));

        res.status(200).json({
            supportQuery: {
                _id: supportQuery._id,
                user_id: supportQuery.user_id,
                category: supportQuery.category,
                status: supportQuery.status,
                priority: supportQuery.priority,
                query_description: supportQuery.query_description,
                submitted_on: supportQuery.submitted_on,
                closed_on: supportQuery.closed_on,
                communicationLog: formattedLog
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getSupportQueriesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Optional query parameters for filtering
    const { 
      category, 
      status, 
      priority,
      sortBy = 'submitted_on',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { user_id: userId };
    
    if (category) {
      filter.category = category;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (priority) {
      filter.priority = priority;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with population
    const queries = await SupportQuery.find(filter)
      .populate('user_id', 'name email') // Populate user details
      .populate('communicationLog.from', 'name email') // Populate sender details in log
      .populate('communicationLog.to', 'name email') // Populate receiver details in log
      .sort(sort);

    res.status(200).json({
      success: true,
      data: queries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user support queries",
      error: error.message
    });
  }
};



module.exports = {
    createSupportQuery,
    getSupportQueryById,
    updateSupportQuery,
    getAllSupportQuery,
    getSupportQueryStats,
    sendMessageFromAdmin,
    sendMessageFromUser,
    getChatLog,
    getSupportQueriesByUser
};
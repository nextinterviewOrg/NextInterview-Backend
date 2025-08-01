const User = require("../Models/user-Model");
const Topic = require("../Models/topicModel");
const NewModule = require("../Models/addNewModuleModel");
const QuestionBank = require("../Models/questionBankModel");
const UserMainQuestionBankProgress = require("../Models/userMainQuestionBankProgressModel");
const UserFeedback = require("../Models/userFeedbackModel");
const ModuleFeedback = require("../Models/moduleFeedbackModel");
const UserProgress = require("../Models/userProgressModel"); // Added for new function
const UserTIYProgress = require("../Models/userTIYProgressModel");
const UserQuestionBankProgress = require("../Models/userQuestionBankProgressModel");
const UserChallengesProgress = require("../Models/userChallengesProgresModel");
const UserSkillAssessmentProgress = require("../Models/userSkillAssessmentProgressModel");
const AiMockInterview = require("../Models/aiMockInterviewModel");

exports.getDashboardMetrics = async (req, res) => {
  try {
    console.log("Fetching dashboard metrics...");
    
    // Get total users count
    const totalUsers = await User.countDocuments();
    console.log("Total users:", totalUsers);
    
    // Get subscribed users count
    const subscribedUsers = await User.countDocuments({ subscription_status: "active" });
    console.log("Subscribed users:", subscribedUsers);
    
    // Get total topics count from all modules
    const allModules = await NewModule.find({ isDeleted: false });
    let totalTopics = 0;
    
    allModules.forEach(module => {
      if (module.topicData && Array.isArray(module.topicData)) {
        totalTopics += module.topicData.length;
      }
    });
    
    console.log("Total topics across all modules:", totalTopics);
    
    // Get average quiz score using the correct model
    const userProgress = await UserMainQuestionBankProgress.find();
    console.log("User progress records found:", userProgress.length);
    
    let totalCorrect = 0;
    let totalQuestions = 0;
    
    userProgress.forEach(progress => {
      progress.progress.forEach(userProgress => {
        userProgress.answered_Questions.forEach(question => {
          totalQuestions++;
          if (question.finalResult) {
            totalCorrect++;
          }
        });
      });
    });
    
    console.log("Total questions:", totalQuestions, "Total correct:", totalCorrect);
    const avgQuizScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    console.log("Average quiz score:", avgQuizScore);
    
    // Get average feedback rating
    const feedbacks = await UserFeedback.find();
    console.log("Feedback records found:", feedbacks.length);
    
    let totalRating = 0;
    let ratingCount = 0;
    
    feedbacks.forEach(feedback => {
      if (feedback.rating) {
        totalRating += feedback.rating;
        ratingCount++;
      }
    });
    
    console.log("Total rating:", totalRating, "Rating count:", ratingCount);
    const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;
    let ratingText = "Neutral";
    
    if (avgRating >= 4.5) {
      ratingText = "Excellent";
    } else if (avgRating >= 3.5) {
      ratingText = "Good";
    } else if (avgRating >= 2.5) {
      ratingText = "Average";
    } else if (avgRating >= 1.5) {
      ratingText = "Poor";
    } else if (avgRating > 0) {
      ratingText = "Very Poor";
    }
    
    console.log("Average rating:", avgRating, "Rating text:", ratingText);
    
    const responseData = {
      totalUsers,
      subscribedUsers,
      totalTopics,
      avgQuizScore: `${avgQuizScore}%`,
      avgRating: ratingText
    };
    
    console.log("Sending response:", responseData);
    
    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard metrics",
      error: error.message
    });
  }
};

// New function for feedback analytics
exports.getFeedbackAnalytics = async (req, res) => {
  try {
    console.log("Fetching feedback analytics...");
    
    // Get all feedback from both UserFeedback and ModuleFeedback
    const userFeedbacks = await UserFeedback.find();
    const moduleFeedbacks = await ModuleFeedback.find();
    
    // Process UserFeedback data
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;
    let totalFeedback = 0;
    
    // Process UserFeedback ratings
    userFeedbacks.forEach(feedback => {
      if (feedback.rating) {
        totalFeedback++;
        if (feedback.rating >= 4) {
          positiveCount++;
        } else if (feedback.rating >= 2) {
          neutralCount++;
        } else {
          negativeCount++;
        }
      }
    });
    
    // Process ModuleFeedback data
    moduleFeedbacks.forEach(moduleFeedback => {
      // Process feedback_one
      moduleFeedback.feedback_one.forEach(feedback => {
        if (feedback.rating && !feedback.skip) {
          totalFeedback++;
          if (feedback.rating >= 4) {
            positiveCount++;
          } else if (feedback.rating >= 2) {
            neutralCount++;
          } else {
            negativeCount++;
          }
        }
      });
      
      // Process feedback_two
      moduleFeedback.feedback_two.forEach(feedback => {
        if (feedback.rating && !feedback.skip) {
          totalFeedback++;
          if (feedback.rating >= 4) {
            positiveCount++;
          } else if (feedback.rating >= 2) {
            neutralCount++;
          } else {
            negativeCount++;
          }
        }
      });
    });
    
    // Calculate percentages
    const positivePercentage = totalFeedback > 0 ? Math.round((positiveCount / totalFeedback) * 100) : 0;
    const neutralPercentage = totalFeedback > 0 ? Math.round((neutralCount / totalFeedback) * 100) : 0;
    const negativePercentage = totalFeedback > 0 ? Math.round((negativeCount / totalFeedback) * 100) : 0;
    
    // Calculate week-over-week change
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const lastWeekFeedbacks = await UserFeedback.find({
      timestamp: { $gte: oneWeekAgo }
    });
    
    const lastWeekModuleFeedbacks = await ModuleFeedback.find({
      createdAt: { $gte: oneWeekAgo }
    });
    
    let lastWeekPositiveCount = 0;
    let lastWeekTotalCount = 0;
    
    // Count last week's positive feedback
    lastWeekFeedbacks.forEach(feedback => {
      if (feedback.rating) {
        lastWeekTotalCount++;
        if (feedback.rating >= 4) {
          lastWeekPositiveCount++;
        }
      }
    });
    
    lastWeekModuleFeedbacks.forEach(moduleFeedback => {
      moduleFeedback.feedback_one.forEach(feedback => {
        if (feedback.rating && !feedback.skip) {
          lastWeekTotalCount++;
          if (feedback.rating >= 4) {
            lastWeekPositiveCount++;
          }
        }
      });
      
      moduleFeedback.feedback_two.forEach(feedback => {
        if (feedback.rating && !feedback.skip) {
          lastWeekTotalCount++;
          if (feedback.rating >= 4) {
            lastWeekPositiveCount++;
          }
        }
      });
    });
    
    const lastWeekPositivePercentage = lastWeekTotalCount > 0 ? Math.round((lastWeekPositiveCount / lastWeekTotalCount) * 100) : 0;
    const weekOverWeekChange = positivePercentage - lastWeekPositivePercentage;
    
    const analyticsData = {
      feedbackData: [
        { label: "Positive", value: positivePercentage, color: "#20c997" },
        { label: "Neutral", value: neutralPercentage, color: "#007bff" },
        { label: "Negative", value: negativePercentage, color: "#ffc107" }
      ],
      totalFeedback,
      lastWeekChange: `${weekOverWeekChange >= 0 ? '+' : ''}${weekOverWeekChange}%`,
      trend: weekOverWeekChange >= 0 ? 'up' : 'down'
    };
    
    console.log("Feedback analytics data:", analyticsData);
    
    res.status(200).json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error("Error fetching feedback analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feedback analytics",
      error: error.message
    });
  }
};

// New function for user activity trends
exports.getUserActivityTrends = async (req, res) => {
  try {
    // Get year from query parameter, default to current year
    const year = parseInt(req.query.year) || new Date().getFullYear();
    
    // Initialize data for the full year (Jan to Dec)
    const activityData = [];
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    // Generate data for all 12 months of the specified year
    for (let month = 0; month < 12; month++) {
      // Create date range for the month (using UTC to avoid timezone issues)
      const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
      
      // Try multiple approaches to find users
      let userCount = 0;
      
      // Approach 1: Try createdAt (Mongoose timestamps)
      userCount = await User.countDocuments({
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      });
      
      // Approach 2: If no users found, try created_at field
      if (userCount === 0) {
        userCount = await User.countDocuments({
          created_at: {
            $gte: startDate,
            $lte: endDate
          }
        });
      }
      
      activityData.push({
        month: monthNames[month],
        users: userCount
      });
    }
    
    // Calculate growth rate (comparing current month with previous month)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    let growthRate = 0;
    let trend = 'up';
    
    if (year === currentYear && currentMonth > 0) {
      // For current year, compare with previous month
      const currentMonthData = activityData[currentMonth];
      const previousMonthData = activityData[currentMonth - 1];
      
      if (previousMonthData && previousMonthData.users > 0) {
        growthRate = Math.round(((currentMonthData.users - previousMonthData.users) / previousMonthData.users) * 100);
        trend = growthRate >= 0 ? 'up' : 'down';
      }
    } else if (year < currentYear) {
      // For past years, compare December with November
      const decemberData = activityData[11];
      const novemberData = activityData[10];
      
      if (novemberData && novemberData.users > 0) {
        growthRate = Math.round(((decemberData.users - novemberData.users) / novemberData.users) * 100);
        trend = growthRate >= 0 ? 'up' : 'down';
      }
    }
    
    const responseData = {
      labels: activityData.map(item => item.month),
      datasets: [{
        label: "Users Growth",
        data: activityData.map(item => item.users),
        borderColor: "#017b9f",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#017b9f"
      }],
      totalUsers: activityData.reduce((sum, item) => sum + item.users, 0),
      currentMonthUsers: year === currentYear ? activityData[currentMonth].users : activityData[11].users,
      growthRate: growthRate,
      trend: trend,
      selectedYear: year
    };
    
    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user activity trends",
      error: error.message
    });
  }
};

// New function for learning activity insights
exports.getLearningActivityInsights = async (req, res) => {
  try {
    // Get time period from query parameter, default to 'week'
    const period = req.query.period || 'week';
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    
    let startDate, endDate;
    
    // Calculate date range based on period
    if (period === 'week') {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (period === 'month') {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else if (period === 'year') {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    }
    
    // Aggregate learning activity by hour
    const hourlyActivity = await UserProgress.aggregate([
      {
        $unwind: '$progress'
      },
      {
        $match: {
          $or: [
            {
              'progress.startedAt': {
                $gte: startDate,
                $lte: endDate
              }
            },
            {
              'progress.completedAt': {
                $gte: startDate,
                $lte: endDate
              }
            }
          ]
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$progress.startedAt' },
            dayOfWeek: { $dayOfWeek: '$progress.startedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.hour': 1, '_id.dayOfWeek': 1 }
      }
    ]);
    
    // Aggregate by day of week
    const dailyActivity = await UserProgress.aggregate([
      {
        $unwind: '$progress'
      },
      {
        $match: {
          $or: [
            {
              'progress.startedAt': {
                $gte: startDate,
                $lte: endDate
              }
            },
            {
              'progress.completedAt': {
                $gte: startDate,
                $lte: endDate
              }
            }
          ]
        }
      },
      {
        $group: {
          _id: { dayOfWeek: { $dayOfWeek: '$progress.startedAt' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.dayOfWeek': 1 }
      }
    ]);
    
    // Process hourly data to find peak and low times
    const hourCounts = new Array(24).fill(0);
    hourlyActivity.forEach(item => {
      if (item._id.hour !== null) {
        hourCounts[item._id.hour] += item.count;
      }
    });
    
    // Find peak time (highest activity)
    const maxActivity = Math.max(...hourCounts);
    const peakHour = hourCounts.indexOf(maxActivity);
    const peakTime = `${peakHour.toString().padStart(2, '0')}:00`;
    
    // Find low time (lowest activity)
    const minActivity = Math.min(...hourCounts.filter(count => count > 0));
    const lowHour = hourCounts.indexOf(minActivity);
    const lowTime = `${lowHour.toString().padStart(2, '0')}:00`;
    
    // Process daily data
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyCounts = new Array(7).fill(0);
    dailyActivity.forEach(item => {
      if (item._id.dayOfWeek !== null) {
        // MongoDB dayOfWeek is 1-7 (Sunday=1), convert to 0-6
        const dayIndex = item._id.dayOfWeek - 1;
        dailyCounts[dayIndex] = item.count;
      }
    });
    
    // Calculate peak time percentage (relative to max activity)
    const peakPercentage = maxActivity > 0 ? Math.round((maxActivity / Math.max(...hourCounts)) * 100) : 0;
    
    // Calculate low time percentage (relative to max activity)
    const lowPercentage = maxActivity > 0 ? Math.round((minActivity / Math.max(...hourCounts)) * 100) : 0;
    
    const responseData = {
      peakTime: {
        time: peakTime,
        percentage: peakPercentage,
        activity: maxActivity
      },
      lowTime: {
        time: lowTime,
        percentage: lowPercentage,
        activity: minActivity
      },
      dailyActivity: dayNames.map((day, index) => ({
        day,
        activity: dailyCounts[index]
      })),
      totalSessions: hourlyActivity.reduce((sum, item) => sum + item.count, 0),
      period,
      selectedYear: year,
      selectedMonth: month
    };
    
    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching learning activity insights",
      error: error.message
    });
  }
};

// New function for user performance analytics (for UserStatsOne component)
exports.getUserPerformanceAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Get user performance data from various sources
    const [
      mainQuestionBankProgress,
      tiyProgress,
      questionBankProgress,
      challengesProgress,
      skillAssessmentProgress
    ] = await Promise.all([
      UserMainQuestionBankProgress.find({ "progress.userId": userId }),
      UserTIYProgress.find({ "progress.userId": userId }),
      UserQuestionBankProgress.find({ "progress.userId": userId }),
      UserChallengesProgress.find({ "progress.userId": userId }),
      UserSkillAssessmentProgress.findOne({ userId })
    ]);

    // Calculate performance by question type
    const performanceByType = {
      "One word answers": { attempted: 0, correct: 0, score: 0 },
      "MCQs": { attempted: 0, correct: 0, score: 0 },
      "Coding": { attempted: 0, correct: 0, score: 0 },
      "Approach analysis": { attempted: 0, correct: 0, score: 0 },
      "Short answers": { attempted: 0, correct: 0, score: 0 }
    };

    // Process Main Question Bank Progress
    mainQuestionBankProgress.forEach(module => {
      module.progress.forEach(userProgress => {
        if (userProgress.userId.toString() === userId) {
          userProgress.answered_Questions.forEach(question => {
            const questionType = question.question_type;
            let category = "Short answers"; // default
            
            if (questionType === 'mcq') category = "MCQs";
            else if (questionType === 'coding') category = "Coding";
            else if (questionType === 'approach') category = "Approach analysis";
            else if (question.answer && question.answer.length <= 10) category = "One word answers";
            
            performanceByType[category].attempted++;
            if (question.finalResult) {
              performanceByType[category].correct++;
            }
          });
        }
      });
    });

    // Process TIY Progress
    tiyProgress.forEach(module => {
      module.progress.forEach(userProgress => {
        if (userProgress.userId.toString() === userId) {
          userProgress.answered_Questions.forEach(question => {
            const questionType = question.question_type;
            let category = "Short answers";
            
            if (questionType === 'mcq') category = "MCQs";
            else if (questionType === 'approach') category = "Approach analysis";
            else if (question.answer && question.answer.length <= 10) category = "One word answers";
            
            performanceByType[category].attempted++;
            // For TIY, we'll consider it correct if answered (simplified logic)
            if (question.answer) {
              performanceByType[category].correct++;
            }
          });
        }
      });
    });

    // Process Question Bank Progress
    questionBankProgress.forEach(module => {
      module.progress.forEach(userProgress => {
        if (userProgress.userId.toString() === userId) {
          userProgress.answered_Questions.forEach(question => {
            const questionType = question.question_type;
            let category = "Short answers";
            
            if (questionType === 'mcq') category = "MCQs";
            else if (questionType === 'approach') category = "Approach analysis";
            else if (question.answer && question.answer.length <= 10) category = "One word answers";
            
            performanceByType[category].attempted++;
            if (question.answer) {
              performanceByType[category].correct++;
            }
          });
        }
      });
    });

    // Process Challenges Progress
    challengesProgress.forEach(challenge => {
      challenge.progress.forEach(userProgress => {
        if (userProgress.userId.toString() === userId) {
          performanceByType["Coding"].attempted++;
          if (userProgress.finalResult) {
            performanceByType["Coding"].correct++;
          }
        }
      });
    });

    // Calculate scores and prepare radar chart data
    const radarData = [];
    const categories = Object.keys(performanceByType);
    
    categories.forEach(category => {
      const data = performanceByType[category];
      const score = data.attempted > 0 ? (data.correct / data.attempted) * 5 : 0; // Scale to 0-5
      radarData.push(Number(score.toFixed(1)));
    });

    // Calculate overall statistics
    const totalAttempted = Object.values(performanceByType).reduce((sum, data) => sum + data.attempted, 0);
    const totalCorrect = Object.values(performanceByType).reduce((sum, data) => sum + data.correct, 0);
    const successRate = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

    // Find strengths and weaknesses
    const scores = categories.map((category, index) => ({
      category,
      score: radarData[index]
    })).sort((a, b) => b.score - a.score);

    const strength = scores[0]?.score > 0 ? scores[0].category : "None yet";
    const weakness = scores[scores.length - 1]?.score < scores[0]?.score ? scores[scores.length - 1].category : "None yet";

    const responseData = {
      radarData,
      categories,
      totalQuestionsAttempted: totalAttempted,
      successfullyCompleted: totalCorrect,
      successRate: Number(successRate.toFixed(1)),
      strength,
      weakness
    };

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error("Error fetching user performance analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user performance analytics",
      error: error.message
    });
  }
};

// New function for mock test analytics (for MockTestsStats component)
exports.getUserMockTestAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Get mock interview data
    const mockInterviews = await AiMockInterview.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .limit(50); // Get last 50 interviews

    // Group by month
    const monthlyData = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize all months with 0
    for (let month = 0; month < 12; month++) {
      const monthName = new Date(currentYear, month).toLocaleString('default', { month: 'short' }).toUpperCase();
      monthlyData[monthName] = 0;
    }

    // Count interviews by month
    mockInterviews.forEach(interview => {
      const interviewDate = new Date(interview.createdAt);
      const monthName = interviewDate.toLocaleString('default', { month: 'short' }).toUpperCase();
      
      if (interviewDate.getFullYear() === currentYear) {
        monthlyData[monthName] = (monthlyData[monthName] || 0) + 1;
      }
    });

    // Prepare chart data
    const labels = Object.keys(monthlyData);
    const data = Object.values(monthlyData);
    
    // Calculate total and monthly change
    const totalMockTests = data.reduce((sum, count) => sum + count, 0);
    
    const currentMonth = new Date().toLocaleString('default', { month: 'short' }).toUpperCase();
    const currentMonthIndex = labels.indexOf(currentMonth);
    const previousMonthIndex = currentMonthIndex > 0 ? currentMonthIndex - 1 : 11;
    
    const currentMonthCount = data[currentMonthIndex] || 0;
    const previousMonthCount = data[previousMonthIndex] || 0;
    
    let monthlyChangePercentage = 0;
    if (previousMonthCount > 0) {
      monthlyChangePercentage = Math.round(((currentMonthCount - previousMonthCount) / previousMonthCount) * 100);
    } else if (currentMonthCount > 0) {
      monthlyChangePercentage = 100; // New activity
    }

    const responseData = {
      labels,
      data,
      totalMockTests,
      monthlyChangePercentage,
      currentMonthCount
    };

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error("Error fetching user mock test analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user mock test analytics",
      error: error.message
    });
  }
};
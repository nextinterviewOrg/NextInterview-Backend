//notificationController.js
const Notification = require('../Models/notificationModel');
const User = require('../Models/user-Model');
const nodemailer = require('nodemailer');
const UserNotification = require('../Models/userNotificationModel');
const mongoose = require('mongoose');
// const sendSMS = require('../utils/sendSms');

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS_KEY,
    }
});



exports.sendNotification = async (req, res) => {
    try {
        const { headingText, subText, Trigger, timeZone, time, frequency, notificationType, created_on } = req.body;

        // Validation: timeZone and frequency are required only if Trigger is "Schedule"
        if (Trigger === "Schedule") {
            if (!timeZone || !frequency) {
                return res.status(400).json({ message: 'timeZone and frequency are required when trigger is Schedule.' });
            }
        }

        // Create new notification in the DB
        const notification = new Notification({
            headingText,
            subText,
            Trigger,
            timeZone: Trigger === "Schedule" ? timeZone : "",  // Only add timeZone if schedule
            time,
            frequency: Trigger === "Schedule" ? frequency : "",  // Only add frequency if schedule
            notificationType,
            created_on,
        });

        await notification.save();

        const users = await User.find();
        for (const user of users) {
            // Create UserNotification for each user
            const userNotification = new UserNotification({
                user_id: user._id,  // User's _id
                notification_id: notification._id,  // Notification's _id
                message: `${headingText}: ${subText}`,
                is_pushed: false, // Initially not pushed
            });

            await userNotification.save();
            console.log(`User notification created for ${user.user_name}`);

            // Conditionally send email
            if (notificationType === "Only e-mail" || notificationType === "Both notification and e-mail") {
                const mailOptions = {
                    from: 'thevasudev31@gmail.com',
                    to: user.user_email, // Dynamically use user email
                    subject: headingText,
                    text: subText
                };

                try {
                    await transporter.sendMail(mailOptions);
                    console.log(`Email sent to ${user.user_email}`);
                } catch (err) {
                    console.error(`Error sending email to ${user.user_email}: ${err}`);
                }
            }
        }

        res.status(200).json({ message: 'Notification sent successfully to users' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error sending notification' });
    }
};


exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find();
        res.status(200).json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

exports.deleteNotification = async (req, res) => {
    const { id } = req.params; // The id is coming from the route params

    if (!id) {
        return res.status(400).json({ message: "Notification ID is required" });
    }

    try {
        // Use mongoose's findByIdAndDelete method to delete by _id
        const deletedNotification = await Notification.findByIdAndDelete(id);

        if (!deletedNotification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};



exports.updateNotification = async (req, res) => {
    try {
        const { headingText, subText, Trigger, timeZone, frequency } = req.body;

        const notification = await Notification.findByIdAndUpdate(req.params.id,  req.body, { new: true });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({ message: 'Notification updated successfully', notification });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating notification' });
    }
};


exports.markNotificationAsRead = async (req, res) => {
    const { userId, notificationId } = req.params;

    try {
        // Convert userId and notificationId to ObjectId if they are strings
        const userNotification = await UserNotification.findOne({
            user_id: new mongoose.Types.ObjectId(userId),
            notification_id: new mongoose.Types.ObjectId(notificationId)

        });

        if (!userNotification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        // Mark the notification as read and pushed (delivered)
        userNotification.is_read = true;
        userNotification.is_pushed = true;
        await userNotification.save();

        res.status(200).json({ message: 'Notification marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error marking notification as read' });
    }
};


exports.getNotificationByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const userNotifications = await UserNotification.find({
            user_id: new mongoose.Types.ObjectId(userId) // Ensure it's ObjectId
        });


        if (userNotifications.length === 0) {
            return res.status(404).json({ message: "No notifications found for this user" });
        }


        res.status(200).json({ message: 'success', data: userNotifications });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};
exports.sendDailyNotification = async (req, res) => {
    try {
        const notifications = await Notification.find({ frequency: 'Daily' });
        console.log(notifications);
        for (const notification of notifications) {
            const users = await User.find();
            for (const user of users) {
                const userNotification = new UserNotification({
                    user_id: user._id,  // User's _id
                    notification_id: notification._id,  // Notification's _id
                    message: `${notification.headingText}: ${notification.subText}`,
                    is_pushed: false, // Initially not pushed
                });

                await userNotification.save();
                console.log(`User notification created for ${user.user_name}`);
                if (notification.notificationType === "Only e-mail" || notification.notificationType === "Both notification and e-mail") {
                    const mailOptions = {
                        from: 'thevasudev31@gmail.com',
                        to: user.user_email, // Dynamically use user email
                        subject: notification.headingText,
                        text: notification.subText
                    };
    
                    try {
                        await transporter.sendMail(mailOptions);
                        console.log(`Email sent to ${user.user_email}`);
                    } catch (err) {
                        console.error(`Error sending email to ${user.user_email}: ${err}`);
                    }
                }

            }


        }
        res.status(200).json({ message: 'Daily notifications sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error sending daily notifications',error: err });  
    }
};


exports.sendWeeklyNotification = async (req, res) => {
    try {
        const currentDate = new Date();
        const currentDay = currentDate.getDay(); 
        console.log(currentDay);

        
        if (currentDay !== 0) {
            return res.status(200).json({ message: 'Today is not Sunday. No weekly notifications sent.' });
        }
        const notifications = await Notification.find({ frequency: 'Weekly' });

        for (const notification of notifications) {
            const users = await User.find();
            for (const user of users) {
                const userNotification = new UserNotification({
                    user_id: user._id,  // User's _id
                    notification_id: notification._id,  // Notification's _id
                    message: `${notification.headingText}: ${notification.subText}`,
                    is_pushed: false, // Initially not pushed
                });

                await userNotification.save();
                console.log(`User notification created for ${user.user_name}`);
                if (notification.notificationType === "Only e-mail" || notification.notificationType === "Both notification and e-mail") {
                    const mailOptions = {
                        from: 'thevasudev31@gmail.com',
                        to: user.user_email, // Dynamically use user email
                        subject:notification.headingText,
                        text: notification.subText
                    };
    
                    try {
                        await transporter.sendMail(mailOptions);
                        console.log(`Email sent to ${user.user_email}`);
                    } catch (err) {
                        console.error(`Error sending email to ${user.user_email}: ${err}`);
                    }
                }

            }


        }
        res.status(200).json({ message: 'Daily notifications sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error sending daily notifications',error: err });
    }
};
const User =require("../Models/user-Model");
const Notification = require("../Models/notificationModel");
const UserNotification = require("../Models/userNotificationModel");
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS_KEY,
    }
});
exports.sendDailyNotificationJobs = async() => {
     try {
            const notifications = await Notification.find({ frequency: 'Daily' });
            console.log(notifications);
            for (const notification of notifications) {
                const now = new Date().toLocaleTimeString('en-GB', {
                    timeZone: notification.timeZone || 'UTC',
                    hour12: false,
                    hour:   '2-digit',
                    minute: '2-digit'
                  });
                  if (now !== notification.time) {
                    continue;
                  }
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
                            from: process.env.EMAIL,
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
            console.log('Daily notifications sent successfully' );
        } catch (err) {
            console.error(err);
            console.log('Error sending daily notifications',"error", err );  
        }
};

exports.weeklyNotificationJobs = async() => {
    try {
            const currentDate = new Date();
            const currentDay = currentDate.getDay(); 
            console.log(currentDay);
    
            
            if (currentDay !== 0) {
                return res.status(200).json({ message: 'Today is not Sunday. No weekly notifications sent.' });
            }
            const notifications = await Notification.find({ frequency: 'Weekly' });
    
            for (const notification of notifications) {
                const now = new Date().toLocaleTimeString('en-GB', {
                    timeZone: notification.timeZone || 'UTC',
                    hour12: false,
                    hour:   '2-digit',
                    minute: '2-digit'
                  });
                  if (now !== notification.time) {
                    continue;
                  }
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
                            from: process.env.EMAIL,
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
            console.error( 'Daily notifications sent successfully' );
        } catch (err) {
            console.error(err);
            console.error( 'Error sending daily notifications',"error", err );
        }
};
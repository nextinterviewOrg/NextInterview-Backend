const Reminder = require("../Models/reminderModel");
const nodemailer = require("nodemailer");
const User = require("../Models/user-Model");

const UserNotification = require("../Models/userNotificationModel");
const mongoose = require("mongoose");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS_KEY,
    },
});

exports.sendRemainder = async (req, res) => {
    try {
        const { heading, subText, notificationType, user_id } = req.body;
        
        // Create a new reminder
        const notification = new Reminder({
            heading,
            subText,
            notificationType,
        });
        await notification.save();

        let users;
        if (user_id && user_id.length > 0) {
            // Fetch specific users by IDs
            users = await User.find({ _id: { $in: user_id } });
        } else {
            // Fetch all users if no specific user IDs are provided
            users = await User.find();
        }

       for (const user of users) {
                   // Create UserNotification for each user
                   const userNotification = new UserNotification({
                       user_id: user._id,  // User's _id
                       notification_id: notification._id,  // Notification's _id
                       message: `${heading}: ${subText}`,
                       is_pushed: false, // Initially not pushed
                   });
       
                   await userNotification.save();
                   console.log(`User notification created for ${user.user_name}`);
       
                   // Conditionally send email
                   if (notificationType === "Only e-mail" || notificationType === "Both notification and e-mail") {
                       const mailOptions = {
                           from: process.env.EMAIL,
                           to: user.user_email, // Dynamically use user email
                           subject: heading,
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
       
       
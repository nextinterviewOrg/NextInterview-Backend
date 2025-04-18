const cron = require('node-cron');
const{sendDailyNotificationJobs,sendWeeklyNotificationJobs} = require('../cronJob/notificationJobs');
const { unrestrictUser } = require("../cronJob/UserJobs");
const connectDB = require("../config/dbConfig");
// Function to setup all cron jobs
exports.setupCronJobs=async ()=> {
    console.log('Setting up cron jobs');
    connectDB();
    // Daily Cron Job: Run every day at midnight
    cron.schedule('*/30 * * * * *', async () => {
        connectDB();
        console.log('Running daily notification task and restriction tasks');
        try {
            await sendDailyNotificationJobs();
            await unrestrictUser();
             // Call the daily notification function
            console.log('Daily notifications sent successfully');
        } catch (err) {
            console.error('Error sending daily notifications:', err);
        }
    });

    // Weekly Cron Job: Run every Sunday at midnight
    cron.schedule( '*/30 * * * * SUN', async () => {
        connectDB();
        console.log('Running weekly notification task');
        try {
            await sendWeeklyNotificationJobs(); // Call the weekly notification function
            console.log('Weekly notifications sent successfully');
        } catch (err) {
            console.error('Error sending weekly notifications:', err);
        }
    });
}


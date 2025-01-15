const  User= require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Webhook } = require('svix');
const crypto = require('crypto');
const { buffer } = require("micro");
const { createClerkClient } = require('@clerk/backend')
 
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
 
 
 
exports.createUser = async function (req, res) {
    try {
        const secret = process.env.CLERK_WEBHOOK_SECRET_KEY;
        const payload = JSON.stringify(req.body)
        const headers = req.headers;
 
 
        const wh = new Webhook(secret);
        const msg = wh.verify(payload, headers);
 
 
        // Handle the webhooks
        const eventType = msg.type;
        if (eventType === 'user.created') {
 
console.log(`User ${msg.data.id} was ${eventType}`);
            // console.log(attributes);
            const firstName = msg.data.first_name;
 
           const userExists = await User.findOne({ email: msg.data.email_addresses[0].email_address, });
            if (userExists) {
                console.log("User already exists in database");
                return res.status(200).json({
                    success: true,
                    message: 'User already exists in database',
                });
            }
 
            const user = new User({
clerkUserId: msg.data.id,
                name:( msg.data.first_name+" "+msg.data.last_name )|| "Anonymous",
                email: msg.data.email_addresses[0].email_address,
                phone: msg.data.phone_numbers[0].phone_number,
            });
            await user.save();
            // Add default public metadata
const updatedUser = await clerkClient.users.updateUser(msg.data.id, {
                public_metadata: {
                    role: "user", // Example: Set default role
                    subscription: "free", // Example: Set default subscription type
                },
            });
            console.log("Updated user with metadata:", updatedUser);
            console.log('User saved to database');
        } else if (eventType === 'user.updated') {
            console.log("user updated ", msg)
const user= await User.findOneAndUpdate({ clerkUserId: msg.data.id }, {
                name: ( msg.data.first_name+" "+msg.data.last_name ) || "Anonymous",
                email: msg.data.email_addresses[0].email_address,
                phone: msg.data.phone_numbers[0].phone_number,
                role: msg.data.public_metadata.role
            })
            console.log("event  ",user)
 
        } else if (eventType === 'user.deleted') {
            console.log("user deleted ", msg)
User.findOneAndDelete({ clerkUserId: msg.data.id }).then((user) => {
                if (user) {
                    console.log("User deleted from database");
                }
            })
        } else {
            console.log("no Matched")
        }
        res.status(200).json({
            success: true,
            message: 'Webhook received',
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            success: false,
            message: err.message,
 
        });
    }
}
 
exports.getUsers = async function (req, res) {
    try {
        const users = await User.find();
        console.log(users);
        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
}
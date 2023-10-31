//this file is contains model for the camera data
const mongoose = require('mongoose');
// Define the stream schema
const streamSchema = new mongoose.Schema({
    name: String,
    accessName: String,
    accessPwd: String,
    cameraIp: String,
});

// Create the Stream model
const Stream = mongoose.model('Stream', streamSchema, 'camerasData');


const userData = new mongoose.Schema({
    username: String,
    email: String,
    password: String
})

const User = mongoose.model('User', userData, 'usersData');

module.exports = { Stream, User };
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

module.exports = Stream;
//this file connects to the database
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/vms'; // Replace with your actual database name

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

module.exports = db;

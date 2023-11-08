const express = require('express');
const cors = require('cors');
const api = require('./src/api/api');
const bodyParser = require('body-parser');
const db = require('./database/connection');
const path = require('path');
const { recordVideo } = require('./src/main/recording');
const app = express();
const PORT = 3000;
const auth = require('./src/api/auth');
const corsOptions = {
    origin: '*',
    methods: 'GET',
    allowedHeaders: '*'
};

app.use(cors(corsOptions));
app.use(express.static('media'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', api);
app.use('/auth', auth);
(async () => {
    try {
        // recordVideo();
        // setInterval(recordVideo, 6000);
    }
    catch (error) {
        console.log(error);
    }
})();
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
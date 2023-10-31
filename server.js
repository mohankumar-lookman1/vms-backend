const express = require('express');
const cors = require('cors');
const api = require('./src/api/api');
const bodyParser = require('body-parser');
const db = require('./database/connection');
const path = require('path');
const recordVideo = require('./src/main/recording');
const app = express();
const PORT = 3000;
app.use(express.static(path.join(__dirname, './media/recordings')));
const auth = require('./src/api/auth');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', api);
app.use('/auth', auth);
(async () => {
    try {
        // await setInterval(recordVideo, 60000);
        // await recordVideo();
        console.log("recording started")
    }
    catch (error) {
        console.log(error);
    }
})();
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const express = require('express');
const cors = require('cors');

const app = express();

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: '*'
};

app.use(cors(corsOptions));
const api = require('./src/api/api');
const bodyParser = require('body-parser');
const db = require('./database/connection');
const path = require('path');

const PORT = 3000;
const auth = require('./src/api/auth');

app.use(express.static('media'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', api);
app.use('/auth', auth);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
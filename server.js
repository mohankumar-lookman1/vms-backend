const express = require('express');
const cors = require('cors');
const api = require('./src/api/api');
const bodyParser = require('body-parser');
const db = require('./database/connection');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', api);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const express = require('express');
const client = require('../../database/connection');
const app = express();
const Stream = require('../../database/models/stream');



app.get('/available-ports', (req, res) => {
    const startStreams = require('../main/streamer');
    startStreams()
        .then((rtspstreams) => {
            const availablePorts = rtspstreams.map(stream => `ws://localhost:${stream.wsPort}`);
            res.json({ availablePorts });
        })
        .catch((error) => {
            console.error('Error starting streams:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});


app.post('/add-stream', async (req, res) => {
    try {
        const { name, ip, username, password } = req.body;
        console.log(req.body);
        if (!name || !ip || !username || !password) {
            res.status(400).send('Bad request');
            return;
        }
        if (client) {
            // Create a new stream document
            const stream = new Stream({
                name: name,
                cameraIp: ip,
                accessName: username,
                accessPwd: password,
            });
            // Save the stream document to the database
            stream.save()
                .then(() => {
                    res.send('Stream added successfully');
                })
                .catch((error) => {
                    console.error('Failed to save stream:', error);
                    res.status(500).send('Failed to add stream');
                });
        }

    } catch (error) {
        console.error('Failed to add stream:', error);
        res.status(500).send('Failed to add stream');
    }

});


module.exports = app;
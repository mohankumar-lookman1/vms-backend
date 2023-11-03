const express = require('express');
const client = require('../../database/connection');
const app = express();
const { Stream } = require('../../database/models/models');
const startStreams = require('../main/streamer');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const getAvailablePorts = app.get('/available-ports', (req, res) => {

    startStreams()
        .then((rtspstreams) => {

            const availablePorts = rtspstreams.map(stream => {
                return {
                    name: stream.camera.name,
                    url: `ws://192.168.1.52:${stream.wsPort}`
                };
            });
            res.json({ availablePorts });
            console.log('Available ports:', availablePorts);
        })
        .catch((error) => {
            console.error('Error starting streams:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

_.throttle(getAvailablePorts, 3000)
app.post('/add-stream', async (req, res) => {
    try {
        const { name, ip, username, password } = req.body;
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
                    startStreams();
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

app.get('/video-stream', async (req, res) => {
    const { cameraname, date, starttime } = req.query;
    const yourIPAddress = '192.168.1.52:3000'; // Replace 'YOUR_IP_ADDRESS' with your actual IP address
    const recordingFolder = path.join('media', 'recordings', cameraname.toString(), date.toString(), starttime.toString());
    const indexFilePath = path.join(recordingFolder, 'index.m3u8');

    // Read the original index.m3u8 file content
    const originalIndexContent = fs.readFileSync(indexFilePath, 'utf-8');

    // Parse the original index.m3u8 file and generate dynamic chunk URLs with your IP address
    const modifiedIndexContent = originalIndexContent
        .split('\n')
        .map((line, index) => {
            if (line.endsWith('.ts')) {
                // Dynamically generate the URL for each .ts chunk with your IP address
                return `${path.join('http://' + yourIPAddress, 'recordings', cameraname, date, starttime, line)}`;
            }
            return line;
        })
        .join('\n');

    // Set the response headers
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.status(200);

    // Send the updated index.m3u8 content with dynamic chunk URLs
    res.send(modifiedIndexContent);
});



module.exports = app;
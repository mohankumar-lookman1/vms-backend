const express = require('express');
const client = require('../../database/connection');
const app = express();
const { Stream } = require('../../database/models/models');
const { startStreams, stopStreams } = require('../main/streamer');
const path = require('path');
const fs = require('fs').promises;

app.get('/available-ports', (req, res) => {
    stopStreams();
    startStreams()
        .then((rtspstreams) => {
            const availablePorts = rtspstreams.map(stream => {
                return {
                    name: stream.camera.name,
                    url: `ws://192.168.1.52:${stream.wsPort}`
                };
            });
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
                .then(() => {
                    stopStreams();
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
    const { cameraname, date, starttime, endtime } = req.query;
    const videoFolderPath = path.join('media', 'recordings', cameraname.toString(), date.toString(), starttime.toString()); // Path to the video folder
    console.log(videoFolderPath)
    try {
        // Read the list of files in the video folder
        const files = await fs.readdir(videoFolderPath);

        // Filter out the files you want to include in the response (e.g., *.ts files)
        const videoFiles = files.filter((file) => file.endsWith('.ts'));

        // Set the appropriate Content-Type for HLS chunks
        res.setHeader('Content-Type', 'application/MP2T');

        // Send each video chunk one by one
        for (const videoFile of videoFiles) {
            const filePath = path.join(videoFolderPath, videoFile);

            // Read the video chunk and send it
            const fileContent = await fs.readFile(filePath);
            res.write(fileContent);


        }

        // End the response
        res.end();
    }
    catch {
        res.status(404).send('Video not found');
    }
});



module.exports = app;
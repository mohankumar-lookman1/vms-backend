const express = require('express');
const client = require('../../database/connection');
const app = express();
const { Stream } = require('../../database/models/models');
const startStreams = require('../main/streamer');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const { recordVideo, ffmpegfunc, recordAll } = require('../main/recording');

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



app.get('/video-recordings', async (req, res) => {
    const { cameraname, date, starttime, endtime } = req.query;
    const videoFolderPath = path.join('media', 'recordings', cameraname, date, starttime); // Path to the video folder

    // Generate HLS playlist file (index.m3u8)
    const originalPlaylistContent = await fs.promises.readFile(videoFolderPath + '/index.m3u8', 'utf8');
    const modifiedIndexContent = originalPlaylistContent
        .split('\n')
        .map((line, index) => {
            if (line.endsWith('.ts')) {
                // Dynamically generate the URL for each .ts chunk with your IP address
                return `${path.join('recordings', cameraname, date, starttime, line)}`;
            }
            return line;
        })
        .join('\n');
    res.writeHead(200, {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*'
    });


    res.write(modifiedIndexContent);


    res.end();
});
app.get('/start-recording', async (req, res) => {
    try {
        await recordAll()
        setInterval(recordAll, 40000);
        res.send('recording started', 200)
    }
    catch (error) {
        console.log(error);
        res.send('error', 500);
    }

})
app.get('/stop-recording', async (req, res) => {
    try {
        activeProcesses.forEach((process) => {
            console.log(process);
            process.kill('SIGKILL'); // Kill the process

        })
        res.send('recording stopped', 200)
    }
    catch (error) {
        console.log(error);
        res.send('error', 500);
    }
})
app.post('/start-recording-one', (req, res) => {
    if (!req.body) {
        res.send('bad request', 400)
        return
    }
    const obj = req.body;
    console.log(req)
    try {
        ffmpegfunc(obj)
        setInterval(ffmpegfunc, 40000);
        res.send('recording started', 200)
    }
    catch (error) {
        console.log(error);
        res.send('error', 500);
    }
});


module.exports = app;
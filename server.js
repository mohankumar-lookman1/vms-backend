const Stream = require('node-rtsp-stream')
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const app = express();
const corsOptions = {
    origin: '*',
    methods: 'GET',
    allowedHeaders: '*'
};

app.use(cors(corsOptions));

function createStreams(rtspUrls) {
    const streams = [];
    rtspUrls.forEach((url, index) => {
        const wsPort = 9990 + index;
        const stream = new Stream({
            name: `cam${index + 1}`,
            streamUrl: url,
            wsPort: wsPort,
            ffmpegOptions: {
                '-stats': '',
                '-r': 20,
                '-s': '1280x720',
                '-preset': 'medium'
            },
        });
        streams.push(stream);
    });
    return streams;
}

const rtspUrls = JSON.parse(fs.readFileSync('rtsp.json', 'utf8')).urls;

const streams = createStreams(rtspUrls);
app.get('/available-ports', (req, res) => {
    const availablePorts = streams.map(stream => `ws://localhost:${stream.wsPort}`);
    res.json({ availablePorts });
});

app.post('/stream', (req, res) => {
    const { name, ip, username, password } = req.body;
    const url = `rtsp://${username}:${password}@${ip}`;

    const rtspUrls = JSON.parse(fs.readFileSync('rtsp.json', 'utf8'));
    rtspUrls.urls.push(url);

    fs.writeFileSync('rtsp.json', JSON.stringify(rtspUrls));

    res.send('Stream added successfully');
});


const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
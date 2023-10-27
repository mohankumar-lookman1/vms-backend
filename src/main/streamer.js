//this file generate mpeg streams based on the rtsp urls

const Stream = require('node-rtsp-stream');
const getRTSPUrls = require('../../database/rtsp');

let rtspstreams = [];

function createStreams(rtspUrls) {
    const streams = [];
    rtspUrls.forEach((url, index) => {
        const wsPort = 9000 + index;
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
        streams.push({ url, wsPort }); // Push an object containing url and wsPort to the streams array
    });
    return streams;
}

function startStreams() {
    return getRTSPUrls()
        .then((rtspUrls) => {
            console.log('RTSP URLs:', rtspUrls);
            rtspstreams = createStreams(rtspUrls);
            return rtspstreams; // Return the modified array
        })
        .catch((error) => {
            console.error('Error fetching RTSP URLs:', error);
            throw error; // Rethrow the error to be caught by the caller
        });
}

module.exports = startStreams;

const Stream = require('node-rtsp-stream');
const getRTSPUrls = require('../../database/rtsp');

let rtspstreams = [];
let activeStreams = []; // Array to store active stream objects
stopStreams();
function createStreams(rtspUrls) {
    const streams = [];
    stopStreams();

    rtspUrls.forEach((camera, index) => {
        const wsPort = 9000 + index;
        const stream = new Stream({
            name: camera.name,
            streamUrl: camera.url,
            wsPort: wsPort,
            ffmpegOptions: {

                '-r': 20,
                '-s': '1280x720',
                '-preset': 'medium'
            },
        });
        streams.push({ wsPort, stream, camera }); // Store the stream object along with other data
    });
    return streams;
}

function startStreams() {
    return getRTSPUrls()
        .then((rtspUrls) => {
            rtspstreams = createStreams(rtspUrls);
            activeStreams = rtspstreams.map(({ stream }) => stream); // Store active stream objects
            return rtspstreams;
        })
        .catch((error) => {
            console.error('Error fetching RTSP URLs:', error);
            throw error;
        });
}

async function stopStreams() {
    activeStreams.forEach((stream) => {
        stream.stop(); // Stop each active stream
    });
    activeStreams = []; // Clear the active streams array
}

module.exports = { startStreams, stopStreams };

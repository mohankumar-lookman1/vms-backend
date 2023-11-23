const Stream = require('node-rtsp-stream');
const getRTSPUrls = require('../../database/rtsp');
const { isCameraAvailable } = require('../main/recording');
let rtspstreams = [];
let activeStreams = []; // Array to store active stream objects
function createStreams(rtspUrls) {
    activeStreams.forEach((stream) => {
        stream.stop();
    });
    activeStreams = [];
    const streams = [];
    rtspUrls.forEach(async (camera, index) => {
        // console.log(camera.ip)
        if (!isCameraAvailable(camera.ip)) {
            console.log('Camera is not available.');
            return;
        }
        const wsPort = 9000 + index;
        const stream = new Stream({
            name: camera.name,
            streamUrl: camera.url,
            wsPort: wsPort,
            ffmpegOptions: {
                '-r': 20,
                '-s': '640x480',
                '-vcodec': 'libx265',
                '-acodec': 'aac',
                '-preset': 'medium',
            },
        });
        streams.push({ wsPort, stream, camera });

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


module.exports = startStreams;

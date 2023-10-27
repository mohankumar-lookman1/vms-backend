//this file retrive camera data from the database and generate rtsp urls based
//on those data

const db = require('./connection');

const Stream = require('./models/stream');

async function getRTSPUrls() {
    try {
        const camerasData = await Stream.find();

        const rtspUrls = camerasData.map((camera) => {
            const { cameraIp, accessName, accessPwd } = camera;
            const rtspUrl = `rtsp://${accessName}:${accessPwd}@${cameraIp}`;
            return rtspUrl;
        });

        return rtspUrls;
    } catch (error) {
        console.error('Failed to retrieve camerasData:', error);
        throw error; // Propagate the error to the caller
    }
}

module.exports = getRTSPUrls;

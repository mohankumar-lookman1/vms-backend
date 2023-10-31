//this file retrive camera data from the database and generate rtsp urls based
//on those data

const db = require('./connection');

const { Stream } = require('./models/models');

async function getRTSPUrls() {
    try {
        const camerasData = await Stream.find();

        const rtspUrls = camerasData.map((camera) => {
            const { cameraIp, accessName, accessPwd, name } = camera;
            const rtspUrl = `rtsp://${accessName}:${accessPwd}@${cameraIp}`;
            return ({
                url: rtspUrl,
                name: name
            });
        });
        return rtspUrls;
    } catch (error) {
        console.error('Failed to retrieve camerasData:', error);
        throw error; // Propagate the error to the caller
    }
}

module.exports = getRTSPUrls;

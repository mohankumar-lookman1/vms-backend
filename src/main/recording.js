const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const getRTSPUrls = require('../../database/rtsp');

async function recordVideo() {
    const mediaFolder = 'media';
    const recordingsFolder = path.join(mediaFolder, 'recordings');

    try {
        // Ensure media and recordings folders exist
        await fs.mkdir(mediaFolder, { recursive: true });
        await fs.mkdir(recordingsFolder, { recursive: true });

        const rtspUrls = await getRTSPUrls();

        rtspUrls.forEach(async (rtspUrlObj) => {
            const { url, name } = rtspUrlObj;
            const cameraName = name;
            const now = new Date();
            const date = now.toISOString().split('T')[0]; // Get current date in format YYYY-MM-DD
            const hour = now.getHours();
            const tenMinuteInterval = Math.floor(now.getMinutes() / 10) * 10; // Get current 10-minute interval
            const folderTimestamp = `${hour}:${tenMinuteInterval}`;
            const outputDir = path.join(recordingsFolder, cameraName, date, folderTimestamp);


            async function isCameraAvailable(url) {
                console.log(url);
                return new Promise((resolve) => {
                    resolve(true);
                });
            }

            isCameraAvailable(url)
                .then(async (isAvailable) => {
                    if (isAvailable) {
                        console.log('Camera is available.');

                        try {
                            // Ensure the output directory exists
                            await fs.mkdir(outputDir, { recursive: true });

                            // Inside the try block, before the `ffmpeg` function call
                            const ffmpegCommand = ffmpeg(url, { timeout: 432000 })
                                .outputOptions([
                                    '-hls_time 10',
                                    '-hls_list_size 0',
                                    '-start_number 0',
                                    '-r 15',
                                    '-f hls',
                                    '-s 640x480',
                                    '-preset slow'
                                ])
                                .output(path.join(outputDir, 'index.m3u8'))
                                .on('end', () => {
                                    console.log(`Conversion for camera ${cameraName} finished. HLS files created.`);
                                    resolve();
                                })
                                .on('error', (err) => {
                                    console.error(`Error converting camera ${cameraName}:`, err);
                                });

                            await new Promise((resolve) => {
                                ffmpegCommand.run();

                            });

                        } catch (error) {
                            console.error(`Error occurred during video conversion for camera ${cameraName}:`, error);
                        }
                    } else {
                        console.log('Camera is not available.');
                    }
                })
                .catch((error) => {
                    console.error(`Error: ${error}`);
                });

        });
    } catch (error) {
        console.error('Error creating necessary folders:', error);
    }
}

module.exports = recordVideo;
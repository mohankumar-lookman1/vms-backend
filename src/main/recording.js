const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const getRTSPUrls = require('../../database/rtsp');
const { exec } = require('child_process');
async function isCameraAvailable(ip) {
    return new Promise((resolve) => {
        exec(`ping -c 1 ${ip}`, (error, stdout) => {
            if (error) {
                console.error(`Error checking camera availability: ${error.message}`);
                resolve(false); // Camera is not available
            } else {
                // Check the response to determine camera availability
                const isAvailable = stdout.includes('1 packets transmitted, 1 received');
                resolve(isAvailable);
            }
        });
    });
}
const activeProcesses = []; // Array to store active FFMPEG processes

async function recordVideo() {
    console.log("recording started")
    const mediaFolder = 'media';
    const recordingsFolder = path.join(mediaFolder, 'recordings');
    try {
        // Stop active FFMPEG processes
        activeProcesses.forEach((process) => {
            console.log(process);
            // process.kill('SIGKILL'); // Kill the process
        });
        activeProcesses.length = 0; // Clear the active processes array
        // Ensure media and recordings folders exist
        await fs.mkdir(mediaFolder, { recursive: true });
        await fs.mkdir(recordingsFolder, { recursive: true });
        const rtspUrls = await getRTSPUrls();
        rtspUrls.forEach(async (rtspUrlObj) => {
            const { url, name, ip } = rtspUrlObj;
            const cameraName = name;
            const now = new Date();
            const date = now.toISOString().split('T')[0]; // Get current date in format YYYY-MM-DD
            const hour = now.getHours();
            const tenMinuteInterval = Math.floor(now.getMinutes() / 10) * 10; // Get current 10-minute interval
            const folderTimestamp = `${hour}:${tenMinuteInterval}`;
            const outputDir = path.join(recordingsFolder, cameraName, date, folderTimestamp);
            isCameraAvailable(ip)
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
                                    '-vcodec libx265',
                                    '-acodec aac',
                                    '-r 15',
                                    '-f hls',
                                    '-s 640x480',
                                    '-preset ultrafast'
                                ])
                                .output(path.join(outputDir, 'index.m3u8'))
                                .on('end', () => {
                                    console.log(`Conversion for camera ${cameraName} finished. HLS files created.`);

                                })
                                .on('error', (err) => {
                                    console.error(`Error converting camera ${cameraName}:`, err);
                                });
                            activeProcesses.push(ffmpegCommand);
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

module.exports = { isCameraAvailable, recordVideo };

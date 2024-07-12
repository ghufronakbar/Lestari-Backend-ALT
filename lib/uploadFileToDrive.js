const { google } = require('googleapis');
const stream = require('stream');

// authClient = await authorize();
// filenname = file name with extension
// fileBuffer = file buffer
// type = 'data', 'profile', 'animals'

const uploadFileToDrive = async (authClient, fileName, fileBuffer, type) => {
    try {
        return new Promise((resolve, reject) => {
            const drive = google.drive({ version: 'v3', auth: authClient });
            const bufferStream = new stream.PassThrough();
            bufferStream.end(fileBuffer);

            let parents = [];

            if (type == 'data') {
                parents = [process.env.DIR_DATA];
            } else if (type == 'profile') {
                parents = [process.env.DIR_PROFILE];
            } else if (type == 'animals') {
                parents = [process.env.DIR_ANIMAL];
            }

            const fileMetaData = {
                name: fileName,
                parents: parents
            };

            const imageTypes = ['jpg', 'jpeg', 'png', 'webp', 'heic'];
            let mimeType = '';

            if (type == 'data') {
                mimeType = 'text/csv';
            } else if (type == 'profile') {
                if (imageTypes.includes(fileName.split('.').pop())) {
                    mimeType = `image/${fileName.split('.').pop()}`;
                } else {
                    throw new Error('File type not supported');
                }
            } else if (type == 'animals') {
                if (imageTypes.includes(fileName.split('.').pop())) {
                    mimeType = `image/${fileName.split('.').pop()}`;
                } else {
                    throw new Error('File type not supported');
                }
            }

            const media = {
                mimeType: mimeType,
                body: bufferStream
            };

            drive.files.create({
                resource: fileMetaData,
                media: media,
                fields: 'id, webViewLink'
            }, (err, file) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(file.data);
                }
            });
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('File upload failed');
    }
};

module.exports = { uploadFileToDrive };
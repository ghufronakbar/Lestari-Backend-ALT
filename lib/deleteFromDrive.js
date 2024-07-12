const { google } = require('googleapis');

const deleteFileFromDrive = async (authClient, fileId) => {
    try {
        const drive = google.drive({ version: 'v3', auth: authClient });
        await drive.files.delete({
            fileId: fileId
        });
        console.log('File deleted successfully');
    } catch (error) {
        console.error('Error deleting file from Google Drive:', error);
        throw new Error('Error deleting file from Google Drive');
    }
};

module.exports = { deleteFileFromDrive };

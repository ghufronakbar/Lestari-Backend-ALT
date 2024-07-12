const { google } = require('googleapis');
const SCOPE = ["https://www.googleapis.com/auth/drive"];


const authorize = async () => {
    try {
        const privateKey = process.env.PRIVATE_KEY.replace(/\\n/gm, '\n');

        const jwtClient = new google.auth.JWT(
            process.env.CLIENT_EMAIL,
            null,
            privateKey,
            SCOPE
        );        
        console.log('Starting authorization');
        await jwtClient.authorize();
        console.log('Authorization successful');
        console.log(jwtClient);
        return jwtClient;
    } catch (error) {
        console.error('Error authorizing:', error);
        console.error(error);
        throw new Error('Authorization failed');
    }
};

module.exports = { authorize };
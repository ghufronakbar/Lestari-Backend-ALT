const { google } = require('googleapis');
const API_KEY = require('../credentials/lestari-9d0d4-6df4e82dd1b2.json');
const SCOPE = ["https://www.googleapis.com/auth/drive"];

const authorize = async () => {
    try {
        const jwtClient = new google.auth.JWT(
            API_KEY.client_email,
            null,
            API_KEY.private_key,
            SCOPE
        );

        await jwtClient.authorize();
        console.log('Authorization successful');
        return jwtClient;
    } catch (error) {
        console.error('Error authorizing:', error);
        throw new Error('Authorization failed');
    }
};

module.exports = { authorize };
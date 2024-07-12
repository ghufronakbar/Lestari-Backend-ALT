
const extractFileIdFromUrl = (url) => {
    try {
        const urlParams = new URLSearchParams(new URL(url).search);
        return urlParams.get('id');
    } catch (error) {
        console.error('Invalid URL:', error);
        return null;
    }
};

module.exports = { extractFileIdFromUrl }
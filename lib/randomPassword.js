const randomPassword = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomPassword = '';

    for (let i = 0; i < 9; i++) {
        randomPassword += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return randomPassword;
}

module.exports = { randomPassword }

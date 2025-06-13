const crypto = require('crypto');
const encryptionKey = 'T@htT@lbak';
const encryptPassword = (text) => {
    const cipher = crypto.createCipher('aes-256-cbc', encryptionKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

const decryptPassword = (encryptedText) => {
    const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    console.log(decrypted)
    return decrypted;
};

const verifyPassword = (plaintextPassword,storedHash) => {
    const hashedPassword = encryptPassword(plaintextPassword);
    return hashedPassword === storedHash;
}

module.exports = {
    encryptPassword,
    decryptPassword,
    verifyPassword
}

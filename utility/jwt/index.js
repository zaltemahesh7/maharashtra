const jwt = require('jsonwebtoken');
const secret = "qwerty7890@";

const generateToken = (payload) => {
    return jwt.sign({
        data: payload
    }, secret, { expiresIn: '24h' });
}

const decodeToken = async (token) => {
    try {
        const decoded = await jwt.verify(token, secret);
        return decoded;
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    generateToken,
    decodeToken
}

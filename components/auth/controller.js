const { send } = require("../../utility/apiResponse");
const service = require("./services");
module.exports = {
    signin: async (req, res) => {
        try {
            const payload = req.body;
            const resp = await service.signin(payload);
            send(resp, res);
        } catch (error) {
            console.error("Signin Error:", error);
            send(new Error("Internal Server Error"), res);
        }
    },

};

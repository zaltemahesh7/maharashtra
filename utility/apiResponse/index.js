const { ERROR_MESSAGE, ERROR_CODE } = require("../constants")

module.exports = {
    send: (apiResponse, res) => {
        if (apiResponse instanceof Error) {
            res.status(+apiResponse.message).send({code: apiResponse.message, message: ERROR_MESSAGE[apiResponse.message]})
        } else {
            res.status(200).send({ code: ERROR_CODE.SUCCESS, body: apiResponse, message: ERROR_MESSAGE[200] })
        }
    }
}

module.exports = {
    ERROR_CODE: {
        INTERNAL_SERVER_ERROR: 500,
        AUTHENTICATION_ERROR: 401,
        NOT_FOUND: 404,
        DUPLICATE_RECOORD: 409,
        SUCCESS: 200,
        DEPENDANT_RECORD: 999,
        BAD_REQUEST: 400
    },
    ERROR_MESSAGE: {
        500: "Internal server error",
        401: "Invalid credentials",
        404: "Record no found",
        409: "Duplicate record found !",
        200: "Operation performed successfully",
        999: "Can't be deleted, Request resource is used in other entity.",
        400: "Bad Request"
    },
}

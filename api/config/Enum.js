/** Response classları için code alanında kullanılmak üzere enum değerleri olarak tanımlanmıştır. */
module.exports = {
    HTTP_CODES: {
        // 1xx Informational
        CONTINUE: 100,
        SWITCHING_PROTOCOLS: 101,
        PROCESSING: 102,

        // 2xx Success
        OK: 200,
        CREATED: 201,
        ACCEPTED: 202,
        NON_AUTHORITATIVE_INFORMATION: 203,
        NO_CONTENT: 204,
        RESET_CONTENT: 205,
        PARTIAL_CONTENT: 206,

        // 3xx Redirection
        MULTIPLE_CHOICES: 300,
        MOVED_PERMANENTLY: 301,
        FOUND: 302,
        SEE_OTHER: 303,
        NOT_MODIFIED: 304,
        TEMPORARY_REDIRECT: 307,
        PERMANENT_REDIRECT: 308,

        // 4xx Client Error
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        PAYMENT_REQUIRED: 402,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        METHOD_NOT_ALLOWED: 405,
        NOT_ACCEPTABLE: 406,
        REQUEST_TIMEOUT: 408,
        CONFLICT: 409,
        GONE: 410,
        PAYLOAD_TOO_LARGE: 413,
        UNSUPPORTED_MEDIA_TYPE: 415,
        UNPROCESSABLE_ENTITY: 422,
        TOO_MANY_REQUESTS: 429,

        // 5xx Server Error
        INTERNAL_SERVER_ERROR: 500,
        NOT_IMPLEMENTED: 501,
        BAD_GATEWAY: 502,
        SERVICE_UNAVAILABLE: 503,
        GATEWAY_TIMEOUT: 504,
    },

    PASSWORD_LENGTH: 8,
    SUPER_ADMIN: "SUPER_ADMIN",

    LOGLEVELS:
    {
        "INFO": "INFO",
        "WARN": "WARN",
        "ERROR": "ERROR",
        "DEBUG": "DEBUG",
        "VERBOSE": "VERBOSE",
        "HTTP": "HTTP"
    },
}
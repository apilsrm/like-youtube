class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    )//kk dinxa yo maile banako constructor
    {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }//these are override like message  sucess is falsse for error
}

export {ApiError}

//constructor() {}// custructor lai override gareko { vitra ko kure le}le   define field haru huncha tyo Error vitra our need aanusar we changre or replace or override 
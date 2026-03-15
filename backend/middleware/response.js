const response = (req, res, next) => {
    res.ok = (data = {}, message = "OK", meta = {}) => {
        res.status(200).json({
            success: true,
            message,
            data,
            meta
        })
    }

    res.created = (data = {}, message = "Created", meta = {}) => {
        res.status(201).json({
            success: true,
            message,
            data,
            meta
        })
    }

    res.badRequest = (message = "Bad Request", error = []) => {
        res.status(400).json({
            success: false,
            message,
            error
        })
    }

    res.unauthorized = (message = "Unauthorized") => {
        res.status(400).json({
            success: false,
            message,

        })
    }

    res.forbidden = (message = "Forbidden") => {
        res.status(403).json({
            success: false,
            message,
        })
    }

    res.notFound = (message = "Not Found") => {
        res.status(404).json({
            success: false,
            message,
        })
    }

     res.serverError = (message = "internal Server Error", error = []) => {
        res.status(500).json({
            success: false,
            message,
            error
        })
    }

    next();
}

module.exports = response;
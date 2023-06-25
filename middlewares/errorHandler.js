//Not found
const notFound = (req, res, next) => {
    const error = new Error(`Not found : ${req.originalUrl}`);
    res.status(404);
    next(error);
};

//Error handler
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode);
    res.json({
        success: false,
        message: err?.message,
    });
};

module.exports = {notFound, errorHandler};
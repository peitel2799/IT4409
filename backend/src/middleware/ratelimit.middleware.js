import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    max: 100,
    handler: function (req, res) {
            res.status(429).send({
                status: 500,
                message: 'Too many requests!',
        });
    },
});
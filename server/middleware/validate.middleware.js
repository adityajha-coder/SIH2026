export const validate = (schema) => (req, res, next) => {
    try {
        // Trim, lowercase, and validate req.body
        req.body = schema.parse(req.body);
        next();
    } catch (error) {
        next(error); // forward to error middleware
    }
};
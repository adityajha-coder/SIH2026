import crypto from "crypto";

export function requestMiddleware(req, res, next){

    // check if client send an x-req-id
    const requestId = req.headers["x-request-id"] || crypto.randomUUID();

    req.id = requestId;

    //return response
    res.setHeader("X-Request-ID", requestId);

    next();
}
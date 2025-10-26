import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    const token = jwt.sign({userId }, process.env.JWT_SECRET, {
        expiresIn: '7d', // token valid for 30 days
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        HttpOnly: true, // prevent XSS attracks : cross site scripting  
        secure: process.env.NODE_ENV === "developmet",
        sameSite: "strict", // CSRF attracks: cross site request forgery
    });
}


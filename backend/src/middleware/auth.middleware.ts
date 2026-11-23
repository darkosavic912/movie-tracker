import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

       const token = req.cookies.accessToken
       
       if(!token) {
        return res.status(401).json({ message : "Deformed token"})
       }

       try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!)
        req.user = decoded as JwtPayload
        next()
       } catch (e) {
        console.error(e)
        return res.status(401).json({
            message: "Token not valid",
            timestamp: new Date()
        })
       }
}
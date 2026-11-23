import { mysqlpool } from "./../db.ts";
import type { User } from "../types/user.ts";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { body, validationResult } from 'express-validator'

const accessSecret = process.env.JWT_ACCESS_SECRET!
const refreshSecret = process.env.JWT_REFRESH_SECRET!
const accessTTL = parseInt(process.env.JWT_ACCESS_TTL || "3600")
const refreshTTL = parseInt(process.env.JWT_REFRESH_TTL || "86400")

export const registerValidation = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('username').isAlphanumeric().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 alphanumeric characters'),
    body('first_name').matches(/^[a-zA-ZčćšđžČĆŠĐŽ]{2,}$/).withMessage('Invalid first name'),
    body('last_name').matches(/^[a-zA-ZčćšđžČĆŠĐŽ]{2,}$/).withMessage('Invalid last name')
]

export const loginValidation = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required')
]

export const register = async (req: Request, res : Response) => {
  const errors = validationResult(req)
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  try {
    const { email, username, password, first_name, last_name } = req.body;
    const [rows] = await mysqlpool.execute(
      "SELECT * FROM user WHERE email = ? AND deleted_at is NULL",
      [email],
    );
    const users = rows as User[];

    if (users.length > 0) {
      return res.status(409).json({ message: "Email already exist" });//User enumeration risk
    }

    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    await mysqlpool.execute(
      "INSERT INTO user(email, username, password_hash , first_name, last_name) VALUES (?, ?, ?, ?, ?)",
      [email, username, password_hash, first_name, last_name],
    );

    return res.status(201).json({
      message: "User added successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Error",
      timestamp: new Date().toISOString()
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req)
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  try {
    const { email, password } = req.body;
    const [rows] = await mysqlpool.execute(
      "SELECT * FROM user WHERE email = ? AND deleted_at IS NULL",
      [email]
    );
    const users = rows as User[];
    const user = users[0];
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }
    const match = await bcrypt.compare(password, user.password_hash);

    if (match) {
      const payload = {
        userId: user.user_id,
        email: user.email,
        username: user.username,
      };
      
      const accessTokenJWT = jwt.sign(payload, accessSecret, {algorithm: 'HS256' as const, expiresIn: accessTTL});
      const refreshTokenJWT = jwt.sign(payload, refreshSecret, {algorithm: 'HS256' as const, expiresIn: refreshTTL})

      res.cookie('accessToken', accessTokenJWT, {
        httpOnly: true,
        secure: false, //needs to be true in  production with HTTTPS
        sameSite: 'strict',
        maxAge: accessTTL * 1000
      })
      res.cookie('refreshToken', refreshTokenJWT, {
        httpOnly: true,
        secure: false, //needs to be true in  production with HTTTPS
        sameSite: 'strict',
        maxAge: refreshTTL * 1000
      })
       return res.status(200).json({ message: "Logged in successfully"});

    } else {
      return res.status(401).json({ message: "Incorrect password"});
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Error",
      timestamp: new Date().toISOString()
    });
  }
};

export const refresh = async(req: Request, res: Response) => {
  try {
     const refreshToken = req.cookies.refreshToken

     if(!refreshToken)
      return res.status(401).json({message: "Refresh token not found"})

     const decoded = jwt.verify(refreshToken,refreshSecret) as JwtPayload

     const newPayload = {
     userId: decoded.userId,
     email: decoded.email,
     username: decoded.username
    }

    const accessTokenJWTNEW = jwt.sign(newPayload, accessSecret, {algorithm: 'HS256' as const, expiresIn: accessTTL});

    res.cookie('accessToken',accessTokenJWTNEW , {
        httpOnly: true,
        secure: false, //needs to be true in  production with HTTTPS
        sameSite: 'strict',
        maxAge: accessTTL * 1000
      })

      return res.status(200).json({ message: "Token successfully refreshed" })

  } catch (e) {
    console.error(e);
    return res.status(401).json({
      message: "Refresh token is invalid",
      timestamp: new Date().toISOString()
    });
  }
}

export const logout = async(req: Request, res: Response) => {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    return res.status(200).json({ message: "Logged out successfully" })
}

export const getMe = async (req: Request, res: Response) => {
    try {
        const { userId } = req.user!
        const [rows] = await mysqlpool.execute(
            "SELECT user_id, email, username, first_name, last_name FROM user WHERE user_id = ? AND deleted_at is NULL",
            [userId]
        )
        const users = rows as User[]
        return res.status(200).json(users[0])
    } catch (e) {
        console.error(e)
        return res.status(500).json({ 
          message: "Error"
        })
    }
}

export const changePassword = async (req: Request, res: Response) => {
    try {
        const { userId } = req.user!
        const { oldPassword, newPassword } = req.body
        const [rows] = await mysqlpool.execute(
            "SELECT user_id, email, username, password_hash FROM user WHERE user_id = ?",
            [userId]
        )
        const users = rows as User[]
        const user = users[0]

        if (!user) return res.status(404).json({ message: "User does not exist" })
        const match = await bcrypt.compare(oldPassword, user.password_hash)

        if (!match) return res.status(400).json({ message: "Incorrect current password" })

        const saltRounds = 12
        const password_hash = await bcrypt.hash(newPassword, saltRounds)
        await mysqlpool.execute("UPDATE user SET password_hash = ? WHERE user_id = ?", [password_hash, userId])

        return res.status(200).json({ message: "Password changed successfully" })
        
    } catch (e) {
        console.error(e)
        return res.status(500).json({ 
          message: "Error"
         })
    }
  }

  export const deleteAccount = async (req: Request, res: Response) => {
    try {
       const { userId } = req.user!
       await mysqlpool.execute("UPDATE user SET deleted_at = NOW(), email = CONCAT(email, 'deleted') WHERE user_id = ?", [userId])
       res.clearCookie('accessToken')
       res.clearCookie('refreshToken')
       return res.status(200).json({ message: "User account deleted successfully"})

    } catch (e) {
      console.error(e)
        return res.status(500).json({  
         message: "Error"
        })
    }
  }
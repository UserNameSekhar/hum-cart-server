import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const adminAuth = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const secretKey = process.env.EXPRESS_APP_JWT_SECRET_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!secretKey || !adminEmail) {
      return response.status(500).json({
        msg: "Server configuration error",
      });
    }

    // Read the token from request headers
    const { token } = request.headers;

    if (!token || typeof token !== "string") {
      return response.status(401).json({
        msg: "No Token Provided or Invalid Token Format!",
      });
    }

    try {
      const decoded: any = jwt.verify(token, secretKey);

      if (decoded.email !== adminEmail) {
        return response.status(401).json({
          msg: "Not Authorized. Login Again!",
        });
      }

      next();
    } catch (error) {
      return response.status(401).json({
        msg: "Invalid Token. Please login again.",
      });
    }
  } catch (error) {
    return response.status(500).json({
      msg: "Unauthorized! Invalid token or server error.",
    });
  }
};

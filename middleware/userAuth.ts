import { NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Define a type for your token payload
interface TokenPayload extends JwtPayload {
  id: string;
}

const userAuth = async (req: any, res: any, next: NextFunction) => {
  const { token } = req.headers;

  if (!token) {
    return res.json({
      success: false,
      message: "Not Authorized, please login again",
    });
  }

  try {
    const token_decode = jwt.verify(
      token,
      process.env.EXPRESS_APP_JWT_SECRET_KEY || ""
    ) as TokenPayload;

    req.body.userId = token_decode.id;
    next();
  } catch (err: any) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

export default userAuth;

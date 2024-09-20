import jwt from "jsonwebtoken";

export const tokenVerifier = async (request: any, response: any, next: any) => {
  try {
    //read the token form request
    let secretKey: string | undefined = process.env.EXPRESS_APP_JWT_SECRET_KEY;
    if (secretKey) {
      let token = request.headers["x-auth-token"];
      if (!token) {
        return response.status(401).json({
          msg: "No Token Provided!",
        });
      }
      if (typeof token === "string" && secretKey) {
        let decodeObj: any = jwt.verify(token, secretKey);
        request.headers["user"] = decodeObj;
        next(); //passing to the actual URL
      } else {
        return response.status(401).json({
          msg: "Invalid Token!",
        });
      }
    }
  } catch (error) {
    return response.status(500).json({
      msg: "Unauthorized!, it is an invalid token..",
    });
  }
};

import { validationResult } from "express-validator";
import { APP_CONSTANTS } from "../constants";

export const validateForm = async (request: any, response: any, next: any) => {
  let errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(401).json({
      msg: errors
        .array()
        .map((error) => error.msg)
        .join("\n"),
      data: null,
      status: APP_CONSTANTS.FAILED,
    });
  }
  next();
};

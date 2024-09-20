import { Response } from "express";
import { APP_CONSTANTS } from "../constants";

export const ThrowError = (
  response: Response,
  statusCode?: number,
  msg?: string
) => {
  return response.status(statusCode ? statusCode : 500).json({
    status: APP_CONSTANTS.FAILED,
    msg: msg ? msg : "Server Error",
    data: null,
  });
};

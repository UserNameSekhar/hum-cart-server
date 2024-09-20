import { Router, Request, Response } from "express";
import * as userController from "../../controllers/userController";
import { body } from "express-validator";
import { validateForm } from "../../middleware/validateForm";
import { tokenVerifier } from "../../middleware/tokenVerifier";

const userRouter = Router();

/**
 * @usage : Register a User
 * @url : http://localhost:9000/api/users/register
 * @params : username, email, password
 * @method : POST
 * @access : PUBLIC
 */
userRouter.post(
  "/register",
  [
    body("username").not().isEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isStrongPassword()
      .withMessage("Strong password is required"),
  ],
  validateForm,
  async (request: Request, response: Response) => {
    await userController.registerUser(request, response);
  }
);

/**
 * @usage : Login a User
 * @url : http://localhost:9000/api/users/login
 * @params : email, password
 * @method : POST
 * @access : PUBLIC
 */
userRouter.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").not().isEmpty().withMessage("Strong password is required"),
  ],
  validateForm,
  async (request: Request, response: Response) => {
    await userController.loginUser(request, response);
  }
);

/**
 * @usage : Login a Admin
 * @url : http://localhost:9000/api/users/admin
 * @params : email, password
 * @method : POST
 * @access : PUBLIC
 */
userRouter.post(
  "/admin",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").not().isEmpty().withMessage("Strong password is required"),
  ],
  validateForm,
  async (request: Request, response: Response) => {
    await userController.loginAdmin(request, response);
  }
);

/**
 * @usage : Get User's Data
 * @url : http://localhost:9000/api/users/me
 * @param : request
 * @param : response
 * @method : GET
 * @access : PRIVATE
 */
userRouter.get(
  "/me",
  tokenVerifier,
  async (request: Request, response: Response) => {
    await userController.getUsersData(request, response);
  }
);

/**
 * @usage : Update Profile Picture
 * @url : http://localhost:9000/api/users/profile
 * @params : imageUrl
 * @method : POST
 * @access : PRIVATE
 */
userRouter.post(
  "/profile",
  [body("imageUrl").not().isEmpty().withMessage("Image Url is Required")],
  tokenVerifier,
  validateForm,
  async (request: Request, response: Response) => {
    await userController.updateProfilePicture(request, response);
  }
);

/**
 * @usage : Change The Password
 * @url : http://localhost:9000/api/users/change-password
 * @param : password
 * @method : POST
 * @access : PRIVATE
 */
userRouter.post(
  "/change-password",
  [
    body("password")
      .isStrongPassword()
      .withMessage("Strong Password is Required"),
  ],
  tokenVerifier,
  validateForm,
  async (request: Request, response: Response) => {
    await userController.changePassword(request, response);
  }
);

/**
 * @usage : Get All Users
 * @url : http://localhost:9000/api/users/
 * @params : no-params
 * @method : GET
 * @access : PRIVATE
 */
userRouter.get(
  "/",
  tokenVerifier,
  async (request: Request, response: Response) => {
    await userController.getAllUsers(request, response);
  }
);

/**
 * @usage : Update a User
 * @url : http://localhost:9000/api/users/:userId
 * @params : username, email, isAdmin, isSuperAdmin
 * @method : PUT
 * @access : PRIVATE
 */
userRouter.put(
  "/:userId",
  tokenVerifier,
  validateForm,
  async (request: Request, response: Response) => {
    await userController.updateUser(request, response);
  }
);

/**
 * @usage : Delete a User
 * @url : http://localhost:9000/api/users/:userId
 * @params : no-params
 * @method : DELETE
 * @access : PRIVATE
 */
userRouter.delete(
  "/:userId",
  tokenVerifier,
  async (request: Request, response: Response) => {
    await userController.deleteUser(request, response);
  }
);

export default userRouter;

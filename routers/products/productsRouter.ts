import { Router, Request, Response } from "express";
import * as productController from "../../controllers/productController";
import { body } from "express-validator";
import { tokenVerifier } from "../../middleware/tokenVerifier";
import { validateForm } from "../../middleware/validateForm";
import upload from "../../middleware/multer";
import { adminAuth } from "../../middleware/adminAuth";

const productsRouter = Router();

/**
 * @usage : Create a Product
 * @url : http://localhost:9000/api/product/add
 * @params : title, description, imageUrl, brand, price, quantity, categoryId, subCategoryId
 * @method : POST
 * @access : PRIVATE
 */
productsRouter.post(
  "/add",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  adminAuth,
  validateForm,
  async (request: Request, response: Response) => {
    try {
      await productController.createProduct(request, response);
      console.log('Body:', request.body);
      console.log('Files:', request.files);
    } catch (error) {
      console.error('Error in createProduct:', error); // Log detailed error
      response.status(500).json({ msg: 'Error creating product', error });
    }
  }
);


/**
 * @usage : Update a Product
 * @url : http://localhost:9000/api/products/:productId
 * @params : title, description, imageUrl, brand, price, quantity, categoryId, subCategoryId
 * @method : PUT
 * @access : PRIVATE
 */
productsRouter.put(
  "/:productId",
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("description").not().isEmpty().withMessage("description is required"),
    body("imageUrl").not().isEmpty().withMessage("imageUrl is required"),
    body("brand").not().isEmpty().withMessage("brand is required"),
    body("price").not().isEmpty().withMessage("price is required"),
    body("quantity").not().isEmpty().withMessage("quantity is required"),
    body("categoryId").not().isEmpty().withMessage("categoryId is required"),
    body("subCategoryId")
      .not()
      .isEmpty()
      .withMessage("subCategoryId is required"),
  ],
  adminAuth,
  validateForm,
  async (request: Request, response: Response) => {
    await productController.updateProduct(request, response);
  }
);

/**
 * @usage : Get All Products
 * @url : http://localhost:9000/api/product/list
 * @params : no-params
 * @method : GET
 * @access : PUBLIC
 */
productsRouter.get(
  "/list",
  async (request: Request, response: Response) => {
    await productController.getAllProducts(request, response);
  }
);

/**
 * @usage : Get a Product
 * @url : http://localhost:9000/api/product/get
 * @params : no-params
 * @method : GET
 * @access : PUBLIC
 */
productsRouter.get(
  "/get",
  async (request: Request, response: Response) => {
    await productController.getProduct(request, response);
  }
);

/**
 * @usage : Delete a Product
 * @url : http://localhost:9000/api/product/remove
 * @params : no-params
 * @method : POST
 * @access : PRIVATE
 */
productsRouter.post(
  "/remove",
  adminAuth,
  async (request: Request, response: Response) => {
    await productController.deleteProduct(request, response);
  }
);

/**
 * @usage : Get All Products with Category ID
 * @url : http://localhost:9000/api/products/categories/:categoryId
 * @params : no-params
 * @method : GET
 * @access : PRIVATE
 */
productsRouter.get(
  "/categories/:categoryId",
  tokenVerifier,
  async (request: Request, response: Response) => {
    await productController.getAllProductsWithCategoryId(request, response);
  }
);

export default productsRouter;

import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { APP_CONSTANTS } from "../constants";
import { IProduct } from "../models/IProduct";
import ProductCollection from "../schemas/ProductSchema";
import { ThrowError } from "../utils/ErrorUtil";
import * as UserUtil from "../utils/UserUtil";

/**
 * @usage : Create a Product
 * @url : http://localhost:9000/api/products/
 * @params : title, description, imageUrl, brand, price, quantity, categoryId, subCategoryId
 * @method : POST
 * @access : PRIVATE
 */
export const createProduct = async (request: any, response: any) => {
  try {
    const {
      name,
      description,
      brand,
      price,
      sizes,
      bestseller,
      category,
      subCategory,
    } = request.body;

    const images = [];

    if (request.files) {
      // Handle file uploads and check if files exist
      const imageKeys = ['image1', 'image2', 'image3', 'image4'];
      for (const key of imageKeys) {
        if (request.files[key] && request.files[key][0]) {
          images.push(request.files[key][0]);
        }
      }
    }

    if (images.length === 0) {
      throw new Error("No images uploaded.");
    }

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        try {
          let result = await cloudinary.uploader.upload(item.path, {
            resource_type: "image",
          });
          return result.secure_url;
        } catch (error) {
          console.error("Image upload failed:", error);
          throw new Error("Image upload failed!");
        }
      })
    );
    
    // Check if the same product is exists
    const theProduct: IProduct | undefined | null =
      await ProductCollection.findOne({ name });
    if (theProduct) {
      return ThrowError(
        response,
        401,
        "The Product with this name is already exists!"
      );
    }

    const newProduct: IProduct = {
      name,
      description,
      brand,
      category,
      subCategory,
      price: Number(price),
      bestseller: bestseller === "true" ? true : false,
      sizes: JSON.parse(sizes),
      image: imagesUrl,
      date: Date.now(),
    };

    console.log(newProduct);

    const createdProduct = await new ProductCollection(newProduct).save();
    if (createdProduct) {
      return response.status(200).json({
        status: APP_CONSTANTS.SUCCESS,
        msg: "New Product is Created Successfully!",
        data: createdProduct,
      });
    }
  } catch (error) {
    console.error("Server Error:", error);
    return ThrowError(response);
  }
};

/**
 * @usage : Update a Product
 * @url : http://localhost:9000/api/products/:productId
 * @params : title, description, imageUrl, brand, price, quantity, categoryId, subCategoryId
 * @method : PUT
 * @access : PRIVATE
 */
export const updateProduct = async (request: any, response: any) => {
  try {
    const {
      title,
      description,
      imageUrl,
      brand,
      price,
      quantity,
      categoryId,
      subCategoryId,
    } = request.body;

    const { productId } = request.params;
    const mongoProductId = new mongoose.Types.ObjectId(productId);

    //Check if the same product is exists
    const theProduct: IProduct | undefined | null =
      await ProductCollection.findById(mongoProductId);
    if (!theProduct) {
      return ThrowError(response, 404, "The Product is not exists!");
    }

    // const newProduct: IProduct = {
    //   name: title,
    //   description: description,
    //   image: imageUrl,
    //   brand: brand,
    //   price: price,
    //   quantity: quantity,
    //   categoryObj: categoryId,
    //   subCategoryObj: subCategoryId,
    //   userObj: theUser._id,
    // };

    // const updatedProduct = await ProductCollection.findByIdAndUpdate(
    //   mongoProductId,
    //   {
    //     $set: newProduct,
    //   },
    //   { new: true }
    // );
    // if (updatedProduct) {
    //   return response.status(200).json({
    //     status: APP_CONSTANTS.SUCCESS,
    //     msg: "Product is Updated Successfully!",
    //     data: updatedProduct,
    //   });
    // }
  } catch (error) {
    return ThrowError(response);
  }
};

/**
 * @usage : Get All Products
 * @url : http://localhost:9000/api/product/list
 * @params : no-params
 * @method : GET
 * @access : PRIVATE
 */
export const getAllProducts = async (request: any, response: any) => {
  try {
    const theProducts: IProduct[] | any = await ProductCollection.find();
    return response.status(200).json({
      status: APP_CONSTANTS.SUCCESS,
      msg: "All Products",
      data: theProducts,
    });
  } catch (error) {
    return ThrowError(response);
  }
};

/**
 * @usage : Get a Product
 * @url : http://localhost:9000/api/product/get
 * @params : no-params
 * @method : GET
 * @access : PRIVATE
 */
export const getProduct = async (request: any, response: any) => {
  try {
    const { productId } = request.body;
    const mongoProductId = new mongoose.Types.ObjectId(productId);

    const theProduct: IProduct | any = await ProductCollection.findById(
      mongoProductId
    )
      .populate({
        path: "userObj",
        strictPopulate: false,
      })
      .populate({
        path: "categoryObj",
        strictPopulate: false,
      })
      .populate({
        path: "subCategoryObj",
        strictPopulate: false,
      });
    if (!theProduct) {
      return ThrowError(response, 404, "Product is not Found!");
    }
    return response.status(200).json({
      status: APP_CONSTANTS.SUCCESS,
      msg: "Product Found",
      data: theProduct,
    });
  } catch (error) {
    return ThrowError(response);
  }
};

/**
 * @usage : Delete a Product
 * @url : http://localhost:9000/api/product/remove
 * @params : no-params
 * @method : POST
 * @access : PRIVATE
 */
export const deleteProduct = async (request: any, response: any) => {
  try {
    const productId = request.body.id;
    console.log(productId);
    const mongoProductId = new mongoose.Types.ObjectId(productId);

      const theProduct: IProduct | any = await ProductCollection.findById(
        mongoProductId
      )
        .populate({
          path: "userObj",
          strictPopulate: false,
        })
        .populate({
          path: "categoryObj",
          strictPopulate: false,
        })
        .populate({
          path: "subCategoryObj",
          strictPopulate: false,
        });
      if (!theProduct) {
        return ThrowError(response, 404, "Product is not Found!");
      }

      const deletedProduct = await ProductCollection.findByIdAndDelete(
        mongoProductId
      );
      if (deletedProduct) {
        return response.status(200).json({
          status: APP_CONSTANTS.SUCCESS,
          msg: `The Product ${theProduct.name} is Deleted!`,
          data: theProduct,
        });
      }
  } catch (error) {
    return ThrowError(response);
  }
};

/**
 * @usage : Get All Products with Category ID
 * @url : http://localhost:9000/api/products/categories/:categoryId
 * @params : no-params
 * @method : GET
 * @access : PRIVATE
 */
export const getAllProductsWithCategoryId = async (
  request: any,
  response: any
) => {
  try {
    const { categoryId } = request.params;
    const theUser: any = await UserUtil.getUser(request, response);
    if (theUser) {
      const products = await ProductCollection.find({
        categoryObj: categoryId,
      })
        .populate({
          path: "userObj",
          strictPopulate: false,
        })
        .populate({
          path: "categoryObj",
          strictPopulate: false,
        })
        .populate({
          path: "subCategoryObj",
          strictPopulate: false,
        });
      return response.status(200).json({
        status: APP_CONSTANTS.SUCCESS,
        msg: "All the products based on Category",
        data: products,
      });
    }
  } catch (error) {
    return ThrowError(response);
  }
};

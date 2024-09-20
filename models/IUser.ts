export interface IUser {
  _id?: string;
  username?: string;
  imageUrl: string;
  email: string;
  password: string;
  cartData?: object; // Optional cartData field matching schema definition
  createdAt?: Date;
  updatedAt?: Date;
}
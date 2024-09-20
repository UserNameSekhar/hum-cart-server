
export interface IProduct {
  _id?: string;
  name: string;
  description: string;
  image: string[];
  brand: string;
  price: number;
  category: string;
  subCategory: string;
  sizes: string[];
  bestseller: boolean;
  date: number;
  createdAt?: Date;
  updatedAt?: Date;
}

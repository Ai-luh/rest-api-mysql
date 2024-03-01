import { Product, Products, UnitProduct } from "./product.interface";
import {v4 as random} from "uuid";
//import fs from "fs";
import mysql from "mysql"

const db = mysql.createConnection({
    host: "localhost",
    user: "root", 
    password: "", 
    database: "restapi", 
  });

  db.connect((err) => {
    if (err) {
      console.error("Error connecting to MySQL: ", err);
      return;
    }
    console.log("Connected to MySQL database.");
  });

  function executeQuery(query: string, values: any): Promise<any> {
    return new Promise((resolve, reject) => {
        db.query(query, values, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });
    });
}

export const findAll = async (): Promise<UnitProduct[]> => {
    const query = "SELECT * FROM products";
    const products = await executeQuery(query, []);
    return products;
};

export const findOne = async (id: string): Promise<UnitProduct | null> => {
    const query = "SELECT * FROM products WHERE id = ?";
    const result = await executeQuery(query, [id]);
    return result.length ? result[0] : null;
};

export const create = async (productInfo: Product): Promise<UnitProduct | null> => {
    const id = random();
    const product: UnitProduct = {
        id: id,
        ...productInfo,
    };
    const query = "INSERT INTO products SET ?";
    await executeQuery(query, product);
    return product;
};

export const update = async (id: string, updateValues: Product): Promise<UnitProduct | null> => {
    const product = await findOne(id);
    if (!product) return null;

    const updatedProduct: UnitProduct = {
        id,
        ...updateValues,
    };

    const query = "UPDATE products SET ? WHERE id = ?";
    await executeQuery(query, [updatedProduct, id]);
    return updatedProduct;
};

export const remove = async (id: string): Promise<void> => {
    const query = "DELETE FROM products WHERE id = ?";
    await executeQuery(query, [id]);
};
import {User, UnitUser, Users} from "./user.interface"
import bcrypt from "bcryptjs"
import {v4 as random} from "uuid"
//import fs from "fs"
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
  
  function loadUsers(): Promise<Users> {
    return new Promise(async (resolve, reject) => {
      try {
        const query = "SELECT * FROM users";
        const users = await executeQuery(query, []);
        const usersMap: Users = {};
        users.forEach((user: any) => {
          usersMap[user.id] = user;
        });
        resolve(usersMap);
      } catch (error) {
        reject(error);
      }
    });
  }
  
  function saveUsers(users: Users): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // For simplicity, you may truncate the table and insert all users again
        const truncateQuery = "TRUNCATE TABLE users";
        await executeQuery(truncateQuery, []);
  
        // Insert each user into the database
        const insertPromises = Object.values(users).map((user) => {
          const insertQuery = "INSERT INTO users SET ?";
          return executeQuery(insertQuery, user);
        });
        await Promise.all(insertPromises);
  
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }  


  export const findAll = async (): Promise<UnitUser[]> => {
    const query = "SELECT * FROM users";
    const users = await executeQuery(query, []);
    return users;
  };
  
  export const findOne = async (id: string): Promise<UnitUser | null> => {
    const query = "SELECT * FROM users WHERE id = ?";
    const result = await executeQuery(query, [id]);
    return result.length ? result[0] : null;
  };
  
  export const create = async (userData: UnitUser): Promise<UnitUser | null> => {
  const id = random();
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  const user: UnitUser = {
    id: id,
    username: userData.username,
    email: userData.email,
    password: hashedPassword,
  };
  const query = "INSERT INTO users SET ?";
  await executeQuery(query, user);
  return user;
};

export const findByName = async (name: string): Promise<UnitUser | null> => {
    try {
      const users = await loadUsers();
      return Object.values(users).find((user) => user.username === name) || null;
    } catch (error) {
      throw error;
    }
  };
  
  export const findByEmail = async (email: string): Promise<UnitUser | null> => {
    try {
      const users = await loadUsers();
      return Object.values(users).find((user) => user.email === email) || null;
    } catch (error) {
      throw error;
    }
  };
  
  export const comparePassword = async (
    email: string,
    suppliedPassword: string
  ): Promise<UnitUser | null> => {
    try {
      const user = await findByEmail(email);
      if (!user) return null;
      const isMatch = await bcrypt.compare(suppliedPassword, user.password);
      return isMatch ? user : null;
    } catch (error) {
      throw error;
    }
  };
  
  export const update = async (
    id: string,
    updateValues: User
  ): Promise<UnitUser | null> => {
    try {
      const user = await findOne(id);
      if (!user) return null;
      const updatedUser: UnitUser = {
        ...user,
        ...updateValues,
      };
      const users = await loadUsers();
      users[id] = updatedUser;
      await saveUsers(users);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };
  
  export const remove = async (id: string): Promise<void> => {
    try {
      const users = await loadUsers();
      if (!users[id]) return;
      delete users[id];
      await saveUsers(users);
    } catch (error) {
      throw error;
    }
  };


import { readFileSync } from "fs";

export const database = {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    logging: false,
    dialectOptions: {
        ssl: {
            ca: readFileSync("./cert/cc-ca.crt").toString(),
        },
    },
};

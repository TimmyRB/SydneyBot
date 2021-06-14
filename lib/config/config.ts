/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Config for Database connection & Model sync
 * @author Jacob Brasil
 *
 * Created at     : 2021-01-30 17:34:46 
 * Last modified  : 2021-06-14 15:15:23
 */

import { readFileSync } from 'fs';
import { Dialect } from 'sequelize-cockroachdb';

interface ConfigType {
    [key: string]: {
        dialect?: Dialect,
        host?: string,
        database?: string,
        username?: string,
        password?: string,
        port: number,
        logging: boolean | (() => void),
        ssl: boolean,
        dialectOptions?: {
            ssl?: {
                ca?: string
            }
        }
    }
}

export const config: ConfigType = {
    production: {
        dialect: "postgres",
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT!, 10),
        logging: false,
        ssl: true,
        dialectOptions: {
            ssl: {
                ca: readFileSync('./certs/cc-ca.crt').toString()
            }
        }
    },
    development: {
        dialect: "postgres",
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT!, 10),
        logging: console.log,
        ssl: true,
        dialectOptions: {
            ssl: {
                ca: readFileSync('./certs/cc-ca.crt').toString()
            }
        }
    }
}

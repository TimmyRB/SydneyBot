import { readFileSync } from 'fs';
import { Sequelize } from 'sequelize-cockroachdb';

export const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT!, 10),
    logging: false,
    dialectOptions: {
        ssl: {
            ca: readFileSync('./certs/cc-ca.crt').toString()
        }
    }
});

sequelize.sync({ force: true })

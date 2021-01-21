import { DataTypes, Sequelize } from "sequelize-cockroachdb";

export default (sequelize: Sequelize) => {
    const Prompt = sequelize.define("prompt", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      content: {
        type: DataTypes.TEXT,
      },
      page: {
        type: DataTypes.INTEGER,
      },
      totalPages: {
        type: DataTypes.INTEGER,
      }
    });
  
    return Prompt;
  };
  
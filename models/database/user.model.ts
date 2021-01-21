import { DataTypes, Sequelize } from "sequelize-cockroachdb";

export default (sequelize: Sequelize) => {
  const User = sequelize.define("user", {
    uuid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    referrals: {
      type: DataTypes.INTEGER,
    }, 
    referrer: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    xp: {
      type: DataTypes.INTEGER,
    },
    commands: {
      type: DataTypes.INTEGER,
    },
    messages: {
      type: DataTypes.INTEGER,
    },
    warns: {
        type: DataTypes.INTEGER,
    },
    muted: {
        type: DataTypes.BOOLEAN
    }
  });

  return User;
};

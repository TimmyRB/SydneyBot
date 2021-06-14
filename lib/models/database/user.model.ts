/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Database Model for a User
 * @author Jacob Brasil
 *
 * Created at     : 2021-01-30 17:37:52 
 * Last modified  : 2021-06-14 14:41:19
 */

import { DataTypes, Model } from 'sequelize-cockroachdb';
import { sequelize } from './'

export class Users extends Model {
  public uuid!: string;
  public referrals!: number;
  public referrer!: string | null;
  public xp!: number;
  public xpLastUpdated!: Date;
  public commands!: number;
  public messages!: number;
  public warns!: number;
  public muted!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Users.init({
  uuid: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  referrals: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  referrer: {
    type: DataTypes.STRING,
    defaultValue: null,
    allowNull: true
  },
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  xpLastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  commands: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  messages: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  warns: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  muted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
}, {
  sequelize
});
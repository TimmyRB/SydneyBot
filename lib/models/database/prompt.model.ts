/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Database Model for Prompts
 * @author Jacob Brasil
 *
 * Created at     : 2021-01-30 17:37:30 
 * Last modified  : 2021-06-14 14:41:11
 */

import { DataTypes, Model } from 'sequelize-cockroachdb';
import { MessageEmbed } from 'discord.js'
import { sequelize } from './'

export class Prompts extends Model {
  id!: string;
  content!: MessageEmbed[];
  page!: number;
  totalPages!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Prompts.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  content: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: [],
    allowNull: false
  },
  page: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  totalPages: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  sequelize
});

import { DataTypes, Model } from 'sequelize-cockroachdb';
import { MessageEmbed } from 'discord.js'
import { sequelize } from '../../config/config'

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

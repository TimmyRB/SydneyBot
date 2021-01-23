import { DataTypes, Model } from 'sequelize-cockroachdb';
import { sequelize } from '../../config/config'

export class Prompts extends Model {
  id!: number;
  content!: string;
  page!: number;
  totalPages!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Prompts.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    defaultValue: '',
    allowNull: true
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

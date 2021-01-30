import { DataTypes, Model, Sequelize, UUIDV4 } from 'sequelize-cockroachdb';
import { sequelize } from '../../config/config'

export class Logs extends Model {
    id!: number;
    uuid!: string;
    cause!: string | null;
    result!: string | null;
    type!: 'log' | 'warn' | 'error'

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Logs.init({
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    uuid: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cause: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    result: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('log', 'warn', 'error'),
        allowNull: false
    }
}, {
    sequelize
});

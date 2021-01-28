import { DataTypes, Model } from 'sequelize-cockroachdb';
import { EmojiResolvable } from 'discord.js'
import { sequelize } from '../../config/config'

export class Assigners extends Model {
    id!: string;
    title!: string;
    description!: string;
    reactionRoles!: { groupId: number, name: string, emoji: EmojiResolvable, roleId: string }[];

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Assigners.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    reactionRoles: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: [],
        allowNull: false
    }
}, {
    sequelize
});

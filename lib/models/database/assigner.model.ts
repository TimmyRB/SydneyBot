/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Database Model for Assigners
 * @author Jacob Brasil
 *
 * Created at     : 2021-01-30 17:33:03 
 * Last modified  : 2021-06-25 15:20:50
 */

import { MessageButtonStyle } from 'discord.js';
import { DataTypes, Model } from 'sequelize-cockroachdb';
import { sequelize } from './'

export class Assigners extends Model {
    id!: string;
    title!: string;
    description!: string;
    reactionRoles!: { groupId: number, name: string, emoji: string, roleId: string, style: MessageButtonStyle }[];

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

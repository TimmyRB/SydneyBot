/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Creates Embed for Year Role Assignment
 * @author Jacob Brasil
 *
 * Created at     : 2021-01-30 17:38:20 
 * Last modified  : 2021-06-25 15:29:28
 */

import { Permissions } from 'discord.js'
import { Assigner, Command } from '../../lib/models/bot';

export const AssignEmbed = new Command({
    name: 'assignembed',
    desc: 'Creates a Role Assignment Embed',
    options: [],
    permissions: new Permissions('MANAGE_ROLES'),
    callback: (interaction, args, dbUser) => {
        let roleAssigner = new Assigner({
            title: 'Role Assignment Info',
            description: 'Click a corresponding button to set your year & campus and gain access to the other channels!',
            reactionRoles: [
                {
                    groupId: 0,
                    name: 'Prospective Student',
                    emoji: '🔮',
                    roleId: '788394400715767808', // 788394400715767808
                    style: 'SECONDARY'
                },
                {
                    groupId: 1,
                    name: '1st Year',
                    emoji: '📗',
                    roleId: '619581998574469120', // 619581998574469120
                    style: 'PRIMARY'
                },
                {
                    groupId: 1,
                    name: '2nd Year',
                    emoji: '📘',
                    roleId: '619582112936362020', // 619582112936362020
                    style: 'PRIMARY'
                },
                {
                    groupId: 1,
                    name: '3rd Year',
                    emoji: '📙',
                    roleId: '619582159899852802', // 619582159899852802
                    style: 'PRIMARY'
                },
                {
                    groupId: 0,
                    name: 'Alumni',
                    emoji: '🧾',
                    roleId: '619582173522952233', // 619582173522952233
                    style: 'PRIMARY'
                },
                {
                    groupId: 2,
                    name: 'Trafalgar',
                    emoji: '1️⃣',
                    roleId: '620641262101463070', // 620641262101463070
                    style: 'SECONDARY'
                },
                {
                    groupId: 2,
                    name: 'Davis',
                    emoji: '2️⃣',
                    roleId: '620641321908043798', // 620641321908043798
                    style: 'SECONDARY'
                }
            ]
        })

        roleAssigner.show(interaction)
    }
})
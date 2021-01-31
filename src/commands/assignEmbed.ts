/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Creates Embed for Year Role Assignment
 * @author Jacob Brasil
 *
 * Created at     : 2021-01-30 17:38:20 
 * Last modified  : 2021-01-30 21:18:17
 */

import { Permissions } from 'discord.js'
import { Assigner, Command } from '../../lib/models/bot';

export const AssignEmbed = new Command({
    name: 'assignembed',
    desc: 'Creates a Role Assignment Embed',
    usage: '!assignEmbed',
    permissions: new Permissions('MANAGE_ROLES'),
    callback: (message, args, dbUser) => {
        let roleAssigner = new Assigner({
            title: 'Role Assignment Info',
            description: 'Click a corresponding reaction to set your year & campus and gain access to the other channels!',
            reactionRoles: [
                {
                    groupId: 0,
                    name: 'Prospective Student',
                    emoji: '🔮',
                    roleId: '788394400715767808'
                },
                {
                    groupId: 1,
                    name: '1st Year',
                    emoji: '📗',
                    roleId: '619581998574469120'
                },
                {
                    groupId: 1,
                    name: '2nd Year',
                    emoji: '📘',
                    roleId: '619582112936362020'
                },
                {
                    groupId: 1,
                    name: '3rd Year',
                    emoji: '📙',
                    roleId: '619582159899852802'
                },
                {
                    groupId: 1,
                    name: 'Alumni',
                    emoji: '🧾',
                    roleId: '619582173522952233'
                },
                {
                    groupId: 2,
                    name: 'Trafalgar',
                    emoji: '1️⃣',
                    roleId: '620641262101463070'
                },
                {
                    groupId: 2,
                    name: 'Davis',
                    emoji: '2️⃣',
                    roleId: '620641321908043798'
                }
            ]
        })

        roleAssigner.show(message.channel, message.author.id)
        message.delete()
    }
})
/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Unmutes a user
 * @author Jacob Brasil
 *
 * Created at     : 2021-01-30 17:42:29 
 * Last modified  : 2021-01-30 21:24:46
 */

import { Permissions, MessageEmbed, } from 'discord.js'
import { Database } from '../../lib/database/database';
import { Command, Prompt } from '../../lib/models/bot';

export const Unmute = new Command({
    name: 'unmute',
    desc: 'Unmutes a User\'s Interactions',
    options: [
        {
            name: 'user',
            type: 'USER',
            description: 'The user to unmute',
            required: true
        }
    ],
    permissions: new Permissions('MANAGE_MESSAGES'),
    callback: (interaction, args, dbUser) => {
        let user = args.get('user')?.user!
        Database.setMuted(user.id, false)

        new Prompt({
            content:
                new MessageEmbed({
                    title: `🔊 Unmuted`,
                    color: 16725558,
                    fields: [
                        {
                            name: 'Unmuted:',
                            value: `${user}`
                        }
                    ]
                })
        }).show(interaction, interaction.user.id)
    }
})
/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Mute's a User's interactions
 * @author Jacob Brasil
 *
 * Created at     : 2021-01-30 17:41:17 
 * Last modified  : 2021-01-30 21:22:37
 */

import { Permissions, GuildMember, MessageEmbed } from 'discord.js'
import { Database } from '../../lib/database/database';
import { Command, Prompt } from '../../lib/models/bot';

export const Mute = new Command({
    name: 'mute',
    desc: 'Mutes a User\'s Interactions',
    options: [
        {
            name: 'user',
            type: 'USER',
            description: 'The user to mute',
            required: true
        }
    ],
    permissions: new Permissions('MANAGE_MESSAGES'),
    callback: (interaction, args, dbUser) => {
        let user = args.get('user')?.user!
        Database.setMuted(user.id, true)

        new Prompt({
            content:
                new MessageEmbed({
                    title: `🔇 Muted`,
                    color: 16725558,
                    fields: [
                        {
                            name: 'Muted:',
                            value: `${user}`
                        }
                    ]
                })
        }).show(interaction, interaction.user.id)

    }
})
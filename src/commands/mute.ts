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
    usage: '!mute <users: User[]>',
    permissions: new Permissions('MANAGE_MESSAGES'),
    callback: (message, args, dbUser) => {
        let members: GuildMember[] = []
        message.mentions.members?.forEach((member, i, a) => {
            Database.setMuted(member.id, true)
            members.push(member)
        })

        if (members.length > 0) {
            new Prompt({
                content: [
                    new MessageEmbed({
                        title: `🔈 Muted ${members.length} User${members.length > 1 ? 's' : ''}`,
                        color: 16725558,
                        fields: [
                            {
                                name: 'Successfully Muted:',
                                value: `\`\`\`${members.map(m => m.displayName).join(', ')}\`\`\``
                            }
                        ]
                    })]
            }).show(message.channel, message.author.id)
        }
    }
})
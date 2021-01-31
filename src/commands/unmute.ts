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

import { Permissions, GuildMember, MessageEmbed, TextChannel } from 'discord.js'
import { Database } from '../../lib/database/database';
import { Command, Prompt } from '../../lib/models/bot';

export const Unmute = new Command({
    name: 'unmute',
    desc: 'Unmutes a User\'s Interactions',
    usage: '!unmute <users: User[]>',
    permissions: new Permissions('MANAGE_MESSAGES'),
    callback: (message, args, dbUser) => {
        let members: GuildMember[] = []
        message.mentions.members?.forEach((member, i, a) => {
            Database.setMuted(member.id, false)
            members.push(member)
        })

        if (members.length > 0) {
            new Prompt({
                content: [
                    new MessageEmbed({
                        title: `🔊 Unmuted ${members.length} User${members.length > 1 ? 's' : ''}`,
                        color: 16725558,
                        fields: [
                            {
                                name: 'Successfully Unmuted:',
                                value: `\`\`\`${members.map(m => m.displayName).join(', ')}\`\`\``
                            }
                        ]
                    })]
            }).show(message.channel, message.author.id)
        }
    }
})
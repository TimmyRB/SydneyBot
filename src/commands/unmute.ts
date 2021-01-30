/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Unmutes a user
 * @author Jacob Brasil
 *
 * Created at     : 2021-01-30 17:42:29 
 * Last modified  : 2021-01-30 17:42:53
 */

import { Permissions, GuildMember, MessageEmbed, TextChannel } from 'discord.js'
import { Database } from '../../lib/database/database';
import Command from '../../lib/models/bot/command.model';
import Prompt from '../../lib/models/bot/prompt.model';

export const Unmute = new Command('unmute', 'Unmutes a User\'s Interactions', '!unmute <users: User[]>', new Permissions('MANAGE_MESSAGES'), (message, args, dbUser) => {
    let members: GuildMember[] = []
    message.mentions.members?.forEach((member, i, a) => {
        Database.setMuted(member.id, false)
        members.push(member)
    })

    if (members.length > 0) {
        new Prompt([
            new MessageEmbed({
                title: `🔊 Unmuted ${members.length} User${members.length > 1 ? 's' : ''}`,
                color: 16725558,
                fields: [
                    {
                        name: 'Successfully Unmuted:',
                        value: `\`\`\`${members.map(m => m.displayName).join(', ')}\`\`\``
                    }
                ]
            })]).show(message.channel, message.author.id)
    }
})
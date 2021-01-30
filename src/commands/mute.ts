import { Permissions, GuildMember, MessageEmbed, TextChannel } from 'discord.js'
import { Database } from '../../lib/database/database';
import Command from '../../lib/models/bot/command.model';
import Prompt from '../../lib/models/bot/prompt.model';

export const Mute = new Command('mute', 'Mutes a User\'s Interactions', '!mute <users: User[]>', new Permissions('MANAGE_MESSAGES'), (message, args, dbUser) => {
    let members: GuildMember[] = []
    message.mentions.members?.forEach((member, i, a) => {
        Database.setMuted(member.id, true)
        members.push(member)
    })

    if (members.length > 0) {
        new Prompt([
            new MessageEmbed({
                title: `🔈 Muted ${members.length} User${members.length > 1 ? 's' : ''}`,
                color: 16725558,
                fields: [
                    {
                        name: 'Successfully Muted:',
                        value: `\`\`\`${members.map(m => m.displayName).join(', ')}\`\`\``
                    }
                ]
            })]).show(message.channel, message.author.id)
    }
})
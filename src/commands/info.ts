import { MessageEmbed, TextChannel } from 'discord.js';
import { Database } from '../../lib/database/database';
import Command from '../../lib/models/bot/command.model';
import Prompt from '../../lib/models/bot/prompt.model';

export const Info = new Command('info', [], (message, args, dbUser) => {
    let pages: MessageEmbed[] = []
    let profsProcessed = 0

    message.mentions.members?.forEach((member, i, a) => {
        Database.findUser(member.id).then(menUser => {
            pages.push(new MessageEmbed({
                title: `${member.displayName}'s Info`,
                color: member.displayColor,
                footer: {
                    text: `User Id: ${member.user.id}`
                },
                thumbnail: {
                    url: member.user.avatarURL() ? member.user.avatarURL({ dynamic: true })! : 'https://cdn.discordapp.com/icons/619560877405896714/a_0f43add0d4ebc78f330e1d0a145d971f.webp'
                },
                fields: [
                    {
                        name: 'Warns',
                        value: `\`\`\`${menUser.warns}\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Muted',
                        value: `\`\`\`${menUser.muted}\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Referrals',
                        value: `\`\`\`${menUser.referrals}\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Commands',
                        value: `\`\`\`${menUser.commands}\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Messages',
                        value: `\`\`\`${menUser.messages}\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Experience',
                        value: `\`\`\`${menUser.xp}\`\`\``,
                        inline: true
                    },
                    {
                        name: 'Invited By',
                        value: message.guild?.client.users.cache.find(u => u.id === menUser.referrer) ? `${message.guild?.client.users.cache.find(u => u.id === menUser.referrer)}` : 'Unknown',
                        inline: true
                    },
                    {
                        name: 'Joined Discord',
                        value: `${member.user.createdAt.toDateString()}`,
                        inline: true
                    },
                    {
                        name: 'Joined Server',
                        value: `${member.joinedAt?.toDateString()}`,
                        inline: true
                    },
                    {
                        name: '**Roles**',
                        value: member.roles.cache.filter(role => role.name !== '@' + 'everyone').size > 0 ? member.roles.cache.filter(role => role.name !== '@' + 'everyone').map(role => `${role}`).join(', ') : 'None'
                    }
                ]
            }))

            profsProcessed++
            if (profsProcessed === a.size) {
                showPrompt(pages, message.channel as TextChannel)
            }
        }).catch(err => console.error(err))
    })
})

function showPrompt(pages: MessageEmbed[], channel: TextChannel) {
    let prompt = new Prompt(pages)
    prompt.show(channel)
}
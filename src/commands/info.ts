/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Displays User(s)' or Channel(s)' info
 * @author Jacob Brasil
 * @author N3rdP1um23
 *
 * Created at     : 2021-01-30 17:40:23 
 * Last modified  : 2021-01-30 17:41:07
 */

import { DMChannel, MessageEmbed, NewsChannel, Permissions, TextChannel } from 'discord.js';
import { Database } from '../../lib/database/database';
import Command from '../../lib/models/bot/command.model';
import Prompt from '../../lib/models/bot/prompt.model';

export const Info = new Command('info', 'Displays information on User(s) or TextChannel(s)', '!info <mentions: User[] | TextChannel[]>', new Permissions(), async (message, args, dbUser) => {
    let pages: MessageEmbed[] = []
    let profsProcessed = 0

    for (let channel of message.mentions.channels.array()) {
        let invites = await channel.fetchInvites()
        pages.push(new MessageEmbed({
            title: `#${channel.name} info`,
            color: 7501437,
            footer: {
                text: `Channel Id: ${channel.id}`
            },
            thumbnail: {
                url: 'https://i.imgur.com/GMlXd6b.png'
            },
            fields: [
                {
                    name: 'NSFW',
                    value: `\`\`\`${channel.nsfw}\`\`\``,
                    inline: true
                },
                {
                    name: 'Invites',
                    value: `\`\`\`${invites.size}\`\`\``,
                    inline: true
                },
                {
                    name: 'Rate Limit',
                    value: `\`\`\`${channel.rateLimitPerUser}\`\`\``,
                    inline: true
                },
                {
                    name: 'Parent',
                    value: `${channel.parent}`,
                    inline: true
                },
                {
                    name: 'Created',
                    value: `${channel.createdAt.toDateString()}`,
                    inline: true
                },
                {
                    name: 'Type',
                    value: `${channel.type.toUpperCase()}`,
                    inline: true
                }
            ]
        }))
    }

    for (let member of message.mentions.members!.array()) {
        let menUser = await Database.findUser(member.id)
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
                    name: 'Roles',
                    value: member.roles.cache.filter(role => role.name !== '@' + 'everyone').size > 0 ? member.roles.cache.filter(role => role.name !== '@' + 'everyone').map(role => `${role}`).reverse().join(', ') : 'None'
                }
            ]
        }))
    }

    showPrompt(pages, message.channel, message.author.id)
})

function showPrompt(pages: MessageEmbed[], channel: TextChannel | DMChannel | NewsChannel, uuid: string) {
    let prompt = new Prompt(pages)
    prompt.show(channel, uuid)
}
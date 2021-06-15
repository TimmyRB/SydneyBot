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
 * Last modified  : 2021-01-30 21:21:53
 */

import { DMChannel, MessageEmbed, NewsChannel, Permissions, TextChannel } from 'discord.js';
import { Database } from '../../lib/database/database';
import { Command, Prompt } from '../../lib/models/bot';

export const Info = new Command({
    name: 'info',
    desc: 'Displays information on User(s) or TextChannel(s)',
    options: [
        {
            name: 'user',
            type: 'USER',
            description: 'A user to get information on'
        },
        {
            name: 'channel',
            type: 'CHANNEL',
            description: 'A channel to get information on'
        }
    ],
    permissions: new Permissions(),
    callback: async (interaction, args, dbUser) => {

        if (args.get('user')?.user !== undefined) {
            let member = interaction.guild?.members.cache.find(m => m.user === args.get('user')?.user!)!
            let menUser = await Database.findUser(member.id)
            let embed = new MessageEmbed({
                title: `${member.displayName}'s Info`,
                color: member.displayColor,
                footer: {
                    text: `User Id: ${member.user.id}`
                },
                thumbnail: {
                    url: member.user.displayAvatarURL({ dynamic: true })
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
                        value: interaction.guild?.client.users.cache.find(u => u.id === menUser.referrer) ? `${interaction.guild?.client.users.cache.find(u => u.id === menUser.referrer)}` : 'Unknown',
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
            })

            let prompt = new Prompt({ content: embed })
            prompt.show(interaction, interaction.user.id)

        } else if (args.get('channel')?.channel !== undefined) {
            let channel = args.get('channel')?.channel! as TextChannel
            let invites = await channel.fetchInvites()
            let embed = new MessageEmbed({
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
            })

            let prompt = new Prompt({ content: embed })
            prompt.show(interaction, interaction.user.id)
        }
    }
})
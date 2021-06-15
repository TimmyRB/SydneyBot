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

import { Permissions, MessageEmbed } from 'discord.js'
import { Database } from '../../lib/database/database';
import { Command, Prompt } from '../../lib/models/bot';

export const Warn = new Command({
    name: 'warn',
    desc: 'Warns a user that they are breaking rules',
    options: [
        {
            name: 'user',
            type: 'USER',
            description: 'The user to warn',
            required: true
        },
        {
            name: 'rule',
            type: 'INTEGER',
            description: 'Rule that was broken',
            required: true,
            choices: [
                {
                    name: '1: Keep it friendly and respectful',
                    value: 1
                },
                {
                    name: '2: Keep chats safe for work',
                    value: 2
                },
                {
                    name: '3: No spamming or trolling',
                    value: 3
                },
                {
                    name: '4: Use the appropriate channels',
                    value: 4
                },
                {
                    name: '5: Enforcing Academic Integrity',
                    value: 5
                }
            ]
        }
    ],
    permissions: new Permissions('KICK_MEMBERS'),
    callback: (interaction, args, dbUser) => {
        let user = args.get('user')?.user!

        if (user === interaction.user) { interaction.deleteReply(); return }

        Database.incrementInfo(user.id, 'warns')

        let rules: RulesType = {
            1: {
                title: 'Rule 1 - Keep it friendly and respectful',
                body: 'We\'re all mature here, please do not be disrespectful towards any users(no hateful nicknames!).Harassment or encouragement of harassment of any kind is not tolerated, including sexual harassment.'
            },
            2: {
                title: 'Rule 2 - Keep chats safe for work',
                body: 'Please do not post any NSFW pictures or links in any of the channels, a lot of us use Discord on our phone or on our computers when in class so keep that in mind.'
            },
            3: {
                title: 'Rule 3 - No spamming or trolling',
                body: 'Spamming is not allowed on this server. No excessive trolling is allowed on this server, do not deliberately make others uncomfortable or deliberately derail a conversation. Do not post any malicious links.'
            },
            4: {
                title: 'Rule 4 - Use the appropriate channels',
                body: 'We have multiple channels, so please make sure your discussion aligns with the channel\'s name and topic.'
            },
            5: {
                title: 'Rule 5 - Enforcing Academic Integrity',
                body: 'Please do not ask for any help on assignments you have for your classes. Academic integrity is taken very seriously at Sheridan and as students in the SDNE program, we all must follow these rules.'
            },
        }

        new Prompt({
            content:
                new MessageEmbed({
                    title: `⚠️ Warning for ${user.tag}`,
                    color: 16725558,
                    fields: [
                        {
                            name: `${rules[args.get('rule')!.value as number].title}`,
                            value: `${rules[args.get('rule')!.value as number].body}`
                        }
                    ]
                })
        }).show(interaction, interaction.user.id)

    }
})

interface RulesType {
    [k: number]: {
        title: string,
        body: string
    }
}
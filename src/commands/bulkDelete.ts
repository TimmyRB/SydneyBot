/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Deletes messages in bulk from a Channel
 * @author Jacob Brasil
 *
 * Created at     : 2021-01-30 17:39:47 
 * Last modified  : 2021-01-30 21:20:28
 */

import { Collection, Message, Permissions, TextChannel } from 'discord.js'
import { Command } from '../../lib/models/bot';

export const BulkDelete = new Command({
    name: 'cleanup',
    desc: 'Cleans up to 100 recent messages in any channel',
    options: [
        {
            name: 'amount',
            type: 'INTEGER',
            description: 'Amount of messages to delete (max 100)',
            required: true
        },
        {
            name: 'hidden',
            type: 'BOOLEAN',
            description: 'Should this command be hidden from other users'
        }
    ],
    permissions: new Permissions('MANAGE_MESSAGES'),
    callback: async (interaction, args, dbUser) => {
        let amount: number = args.get('amount')?.value as number

        if (amount > 100)
            amount = 100

        let channel = interaction.channel as TextChannel

        let messages = await interaction.channel.messages.fetch()
        let filtered: Message[] = [];

        messages.array().forEach((m, i) => {
            if (i <= amount && m.interaction?.id !== interaction.id)
                filtered.push(m)
        })

        await channel.bulkDelete(filtered, true)
            .then(deleted => {
                interaction.followUp({ content: `Successfully deleted ${deleted.size} messages from ${channel}`, ephemeral: true }).catch(err => console.error(err))
            }).catch(err => console.error(err))
    }
})
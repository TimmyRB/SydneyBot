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

import { Permissions, TextChannel } from 'discord.js'
import { Command } from '../../lib/models/bot';

export const BulkDelete = new Command({
    name: 'cleanup',
    desc: 'Cleans up to 100 recent messages in any channel',
    usage: '!cleanup <amount: number>',
    permissions: new Permissions('MANAGE_MESSAGES'),
    callback: (message, args, dbUser) => {
        let amount: number = parseInt(args[0], 10)

        if (amount > 100)
            amount = 100

        message.delete()

        let channel = message.channel as TextChannel
        channel.bulkDelete(amount, true).then(deleted => {
            channel.send(`${message.author}, deleted ${deleted.size} messages from ${channel}`).then(reply => setTimeout(() => reply.delete(), 5000))
        })
    }
})
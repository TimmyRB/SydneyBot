import { TextChannel } from 'discord.js'
import Command from '../../lib/models/bot/command.model';
import { HelpMenu } from '../prompts';

export const BulkDelete = new Command('cleanup', [], (message, args, dbUser) => {
    let amount: number = parseInt(args[0], 10)

    if (amount > 100)
        amount = 100

    message.delete()

    let channel = message.channel as TextChannel
    channel.bulkDelete(amount, true).then(deleted => {
        channel.send(`${message.author}, deleted ${deleted.size} messages from ${channel}`).then(reply => setTimeout(() => reply.delete(), 5000))
    })
})
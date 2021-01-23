import * as dotenv from 'dotenv';
dotenv.config();

import * as Discord from 'discord.js'
import Command from './lib/models/bot/command.model';
import { Ping } from './src/commands';
import { Database } from './lib/database/database';

const bot = new Discord.Client();

const commands: Command[] = [Ping]

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user?.tag}`)
    commands.sort((a, b) => { return b.permissions.length - a.permissions.length })
})

bot.on('message', message => {
    if (message.author === bot.user)
        return

    if (message.channel.type === 'dm' || message.channel.type === 'news')
        return

    if (message.content.startsWith('!')) {
        let found = false
        for (let c of commands) {
            found = c.run(message)
            if (found)
                break
        }

        if (!found) {
            message.react('❓')
        }
    }

    Database.addXp(message.author.id)
})

bot.login(process.env.BOT_TOKEN)

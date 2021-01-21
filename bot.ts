import dotenv from 'dotenv';
import * as Discord from 'discord.js'
import Command from './models/bot/command.model';
import { Ping, Slurp } from './commands';

const bot = new Discord.Client();

dotenv.config();

const commands: Command[] = [Ping, Slurp]

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user?.tag}`)
    commands.sort((a, b) => { return a.permissions.length - b.permissions.length })
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
})

bot.login(process.env.BOT_TOKEN)

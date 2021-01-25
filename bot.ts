import * as dotenv from 'dotenv';
dotenv.config();

import * as Discord from 'discord.js'
import Command from './lib/models/bot/command.model';
import * as Commands from './src/commands';
import { Database } from './lib/database/database';
import Prompt from './lib/models/bot/prompt.model';

const bot = new Discord.Client({ partials: ['MESSAGE', 'REACTION'] });

// Commands need to be added here before they'll work
const commands: Command[] = [Commands.Info, Commands.Help, Commands.BulkDelete, Commands.RMP]

// Invites will be cached here
const invites: any = {}

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user?.tag}`)
    commands.sort((a, b) => { return b.permissions.length - a.permissions.length })

    setTimeout(() => {
        bot.guilds.cache.forEach(guild => {
            guild.fetchInvites().then(guildInvites => {
                invites[guild.id] = guildInvites
            })
        })
    }, 1000)
})

// Handle Messages
bot.on('message', message => {
    if (message.author === bot.user)
        return

    if (message.channel.type === 'dm' || message.channel.type === 'news')
        return

    Database.findUser(message.author.id).then(dbUser => {
        if (dbUser.muted) {
            message.delete()
            return
        }

        if (message.content.startsWith('!')) {
            let found = false
            for (let c of commands) {
                found = c.run(message, dbUser)
                if (found)
                    break
            }

            if (!found) {
                message.react('❓')
            } else {
                Database.incrementInfo(message.author.id, 'commands')
            }
        }

        Database.incrementInfo(message.author.id, 'messages')
        Database.generateXP(message.author.id)
    }).catch(err => console.error(err))
})

bot.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.me)
        return

    if (reaction.partial) {
        try {
            await reaction.fetch()
        } catch (err) {
            console.error(err)
            return
        }
    }

    if (user.partial) {
        try {
            await user.fetch()
        } catch (err) {
            console.error(err)
            return
        }
    }

    const users = await reaction.users.fetch()

    // Prompt Command
    if (users.has(bot.user!.id)) {
        let p = await Database.findPrompt(reaction.message.id)
        let prompt = new Prompt(p.content, p.id, p.page, p.totalPages)

        switch (reaction.emoji.name) {
            case '◀':
                prompt.previousPage(reaction.message)
                reaction.users.remove(user as Discord.User)
                break;

            case '▶':
                prompt.nextPage(reaction.message)
                reaction.users.remove(user as Discord.User)
                break;
        }
    }
})

// Handle Discord User Joining Server
bot.on('guildMemberAdd', member => {
    console.log('Member Joined')
    member.guild.fetchInvites().then(guildInvites => {
        const existingInvites: Discord.Collection<string, Discord.Invite> = invites[member.guild.id]
        invites[member.guild.id] = guildInvites
        const invite = guildInvites.find(i => existingInvites.get(i.code)?.uses! < i.uses!)
        Database.setReferrer(member.id, invite!.inviter!.id!)
        console.log(`Joined ${member.id}, Referrer: ${invite?.inviter?.id!}`)
    })
})

// Handle new Invite being created
bot.on('inviteCreate', invite => {
    invite.guild?.fetchInvites().then(guildInvites => {
        invites[invite.guild!.id] = guildInvites
    })
})

bot.login(process.env.BOT_TOKEN)

import * as dotenv from 'dotenv';
dotenv.config();

import * as Discord from 'discord.js'
import Command from './lib/models/bot/command.model';
import * as Commands from './src/commands';
import { Database } from './lib/database/database';
import Prompt from './lib/models/bot/prompt.model';
import Assigner from './lib/models/bot/assigner.model';
import { cpuUsage } from 'process';
import { Logger } from './lib/database/logger';

const bot = new Discord.Client({ partials: ['MESSAGE', 'REACTION'] });

// Commands need to be added here before they'll work
const commands: Command[] = [Commands.Info, Commands.BulkDelete, Commands.RMP, Commands.AssignEmbed, Commands.Mute, Commands.Unmute]

// Invites will be cached here
const invites: any = {}

// Help Menu
var helpMenu: Prompt

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user?.tag}`)
    commands.sort((a, b) => { return a.permissions.toArray().length - b.permissions.toArray().length })

    bot.user?.setActivity('for !help', { type: 'WATCHING' })

    let pages: Discord.MessageEmbed[] = []
    for (let i = 0; i < commands.length; i += 2) {
        pages.push(new Discord.MessageEmbed({
            title: `Help Menu - Page ${pages.length + 1} / ${Math.ceil(commands.length / 2)}`,
            fields: [
                {
                    name: `${commands[i].name}`,
                    value: `${commands[i].desc}\n\n**Permissions:**\n${commands[i].permissions.toArray().length > 0 ? commands[i].permissions.toArray().map(p => `• ${p.toString()}`).join('\n') : 'None'}\n\n**Usage:**\n\`\`\`${commands[i].exampleRun}\`\`\``
                },
                {
                    name: `${commands[i + 1].name}`,
                    value: `${commands[i + 1].desc}\n\n**Permissions:**\n${commands[i + 1].permissions.toArray().length > 0 ? commands[i + 1].permissions.toArray().map(p => `• ${p.toString()}`).join('\n') : 'None'}\n\n**Usage:**\n\`\`\`${commands[i + 1].exampleRun}\`\`\``
                }]
        }))
    }

    helpMenu = new Prompt(pages)
    commands.reverse()

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
    if (message.channel.type === 'dm' || message.channel.type === 'news')
        return

    Database.findUser(message.author.id).then(dbUser => {
        if (dbUser.muted) {
            message.delete()
            return
        }

        Database.incrementInfo(message.author.id, 'messages')

        if (message.author === bot.user)
            return

        Database.generateXP(message.author.id)

        if (message.content.startsWith('!')) {
            let found = false

            if (message.content.startsWith('!help')) {
                helpMenu.show(message.channel, message.author.id)
                found = true
            }

            for (let c of commands) {
                if (found)
                    break

                found = c.run(message, dbUser)
            }

            if (!found) {
                message.react('❓')
            } else {
                Database.incrementInfo(message.author.id, 'commands')
            }
        }
    }).catch(err => Logger.error(message.author.id, 'Database.findUser', err))

    if (message.attachments.size > 0 || message.content.indexOf('http://') !== -1 || message.content.indexOf('https://') !== -1) {
        message.react('👍').then(() => message.react('📌'))
    }
})

bot.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.partial) {
        try {
            await reaction.fetch()
        } catch (err) {
            Logger.error(user.id, 'reaction.fetch', err)
            return
        }
    }

    if (user.partial) {
        try {
            await user.fetch()
        } catch (err) {
            Logger.error(user.id, 'user.fetch', err)
            return
        }
    }

    if (reaction.me)
        return

    Database.findUser(reaction.message.author.id).then(async dbUser => {
        if (dbUser.muted) {
            reaction.remove()
            return
        }

        const users = await reaction.users.fetch()
        Logger.log(user.id, `${reaction.emoji.name} on ${reaction.message.id}`, 'Ran MessageReactionAdd')

        // Prompt & Assigner Command
        if (users.has(bot.user!.id)) {
            if (reaction.emoji.name === '◀' || reaction.emoji.name === '▶' || reaction.emoji.name === '👍' || reaction.emoji.name === '📌' || reaction.emoji.name === '❓') {
                switch (reaction.emoji.name) {
                    case '◀':
                        let p1 = await Database.findPrompt(reaction.message.id)
                        let prompt1 = new Prompt(p1.content, p1.id, p1.page, p1.totalPages)
                        reaction.users.remove(user as Discord.User)
                        prompt1.previousPage(reaction.message)
                        break;

                    case '▶':
                        let p2 = await Database.findPrompt(reaction.message.id)
                        let prompt2 = new Prompt(p2.content, p2.id, p2.page, p2.totalPages)
                        reaction.users.remove(user as Discord.User)
                        prompt2.nextPage(reaction.message)
                        break;

                    case '👍':
                        Database.addXP(reaction.message.author.id, 5)
                        break;

                    case '📌':
                        user.send(`${reaction.message.author} sent:\n${reaction.message.content}`, reaction.message.attachments.array().length > 0 ? reaction.message.attachments.array() : (reaction.message.embeds))
                        if (reaction.count === 16)
                            reaction.message.pin().catch(err => Logger.error(reaction.message.author.id, 'message.pin', err))
                        break;

                    case '❓':
                        helpMenu.show(reaction.message.channel, user.id)
                }
            } else {
                Database.findAssigner(reaction.message.id).then(a => {
                    let assigner = new Assigner(a.title, a.description, a.reactionRoles, a.id)
                    assigner.assignRole(bot, reaction.message, reaction, user as Discord.User)
                }).catch(err => Logger.error(user.id, 'Database.findAssigner', err))
            }
        } else {
            Database.addXP(reaction.message.author.id, 1)
        }
    }).catch(err => Logger.error(reaction.message.author.id, 'Database.findUser', err))
})

// Handle Discord User Joining Server
bot.on('guildMemberAdd', member => {
    Logger.log(member.id, `${member.id} Joined Server`, 'Ran GuildMemberAdd')
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
    Logger.log(invite.inviter!.id, 'User Created Invite', 'Ran InviteCreate')
    invite.guild?.fetchInvites().then(guildInvites => {
        invites[invite.guild!.id] = guildInvites
    })
})

// Handle Message being Edited
bot.on('messageUpdate', async message => {
    if (message.partial) {
        try {
            await message.fetch()
        } catch (err) {
            Logger.error(message.author!.id, 'reaction.fetch', err)
            return
        }
    }

    Database.findUser(message.author!.id).then(dbUser => {
        if (dbUser.muted) {
            message.delete()
            return
        }
    }).catch(err => Logger.error(message.author!.id, 'Database.findUser', err))
})

bot.login(process.env.BOT_TOKEN)

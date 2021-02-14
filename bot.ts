/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Main file for the Bot
 * @author Jacob Brasil
 *
 * Created at     : 2021-01-30 17:43:13 
 * Last modified  : 2021-01-30 22:26:45
 */

import * as dotenv from 'dotenv';
dotenv.config();

import * as Discord from 'discord.js'
import { Command, Prompt, Assigner } from './lib/models/bot';
import * as Commands from './src/commands';
import { Database } from './lib/database/database';
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
    commands.sort((a, b) => { return a.data.permissions.toArray().length - b.data.permissions.toArray().length })

    bot.user?.setActivity('for !help', { type: 'WATCHING' })

    let pages: Discord.MessageEmbed[] = []
    for (let i = 0; i < commands.length; i += 2) {
        let fields: Discord.EmbedFieldData[] = []

        fields.push({
            name: `${commands[i].data.name}`,
            value: `${commands[i].data.desc}\n\n**Permissions:**\n${commands[i].data.permissions.toArray().length > 0 ? commands[i].data.permissions.toArray().map(p => `• ${p.toString()}`).join('\n') : 'None'}\n\n**Usage:**\n\`\`\`${commands[i].data.usage}\`\`\``
        })

        if (commands[i + 1] !== undefined) {
            fields.push({
                name: `${commands[i + 1].data.name}`,
                value: `${commands[i + 1].data.desc}\n\n**Permissions:**\n${commands[i + 1].data.permissions.toArray().length > 0 ? commands[i + 1].data.permissions.toArray().map(p => `• ${p.toString()}`).join('\n') : 'None'}\n\n**Usage:**\n\`\`\`${commands[i + 1].data.usage}\`\`\``
            })
        }

        pages.push(new Discord.MessageEmbed({
            title: `Help Menu - Page ${pages.length + 1} / ${Math.ceil(commands.length / 2)}`,
            fields: fields
        }))
    }

    helpMenu = new Prompt({ content: pages })
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
                for (let p of helpMenu.data.content) {
                    p.setAuthor(message.member?.displayName, message.author.displayAvatarURL({ dynamic: true }))
                }
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

// Handle Reaction being Added
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
                        let prompt1 = new Prompt({ content: p1.content, id: p1.id, page: p1.page, totalPages: p1.totalPages })
                        reaction.users.remove(user as Discord.User)
                        prompt1.previousPage(reaction.message)
                        break;

                    case '▶':
                        let p2 = await Database.findPrompt(reaction.message.id)
                        let prompt2 = new Prompt({ content: p2.content, id: p2.id, page: p2.page, totalPages: p2.totalPages })
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
                        reaction.message.reactions.removeAll()
                        bot.guilds.cache.find(g => g.id === process.env.BOT_GUILD)?.members.fetch().then(members => {
                            let member = members.find(m => m.user === user)
                            for (let p of helpMenu.data.content) {
                                p.setAuthor(member?.displayName, user.displayAvatarURL({ dynamic: true }))
                            }
                            helpMenu.show(reaction.message.channel, user.id)
                        })
                        break;
                }
            } else {
                Database.findAssigner(reaction.message.id).then(a => {
                    let assigner = new Assigner({ title: a.title, description: a.description, reactionRoles: a.reactionRoles, id: a.id })
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
    let channel = bot.guilds.cache.find(g => g.id === '619560877405896714')?.channels.cache.find(c => c.id === '619560877405896716') as Discord.TextChannel
    channel.send(`Welcome ${member.user} to the\n**Sheridan SDNE Discord!**\nMake sure to assign your role in <#704216085444165682>`)
    member.guild.fetchInvites().then(guildInvites => {
        const existingInvites: Discord.Collection<string, Discord.Invite> = invites[member.guild.id]
        invites[member.guild.id] = guildInvites
        const invite = guildInvites.find(i => existingInvites.get(i.code)?.uses! < i.uses!)
        Database.setReferrer(member.id, invite!.inviter!.id)
        Database.addXP(invite!.inviter!.id, 15)
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
            Logger.error(message.id, 'reaction.fetch', err)
            return
        }
    }

    Database.findUser(message.author!.id).then(dbUser => {
        if (dbUser.muted) {
            message.delete().catch(err => Logger.error(message.author!.id, 'message.delete', err))
            return
        }
    }).catch(err => Logger.error(message.author!.id, 'Database.findUser', err))
})

bot.login(process.env.BOT_TOKEN)

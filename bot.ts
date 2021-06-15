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
import { Command, Assigner } from './lib/models/bot';
import * as Commands from './src/commands';
import { Database } from './lib/database/database';
import { Logger } from './lib/database/logger';

const intents = new Discord.Intents();
intents.add('DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILDS', 'GUILD_INVITES', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS')
const bot = new Discord.Client({ intents: intents });

// Commands need to be added here before they'll work
const commands: Command[] = [Commands.Info, Commands.BulkDelete, Commands.RMP, Commands.AssignEmbed, Commands.Mute, Commands.Unmute, Commands.Warn]

// Invites will be cached here
const invites: any = {}

interface PermissionsType {
    [k: string]: Discord.ApplicationCommandPermissionData[]
}

bot.on('ready', async () => {
    console.log(`Logged in as ${bot.user?.tag}`)

    bot.user?.setActivity('over SDNE 👀', { type: 'WATCHING' })

    bot.application?.commands.fetch().then(commands => commands.forEach(c => {
        c.delete().catch(err => console.error(err))
    }))

    var appCommands: Discord.ApplicationCommandData[] = []

    var permissions: PermissionsType = {}

    for (let c of commands) {
        let data: Discord.ApplicationCommandData = {
            name: c.data.name,
            description: c.data.desc,
            options: c.data.options,
            defaultPermission: !(c.data.permissions.toArray().length > 0)
        }

        permissions[c.data.name] = []

        if (c.data.permissions.toArray().length > 0) {
            (await bot.guilds.cache.get(`${BigInt(process.env.BOT_GUILD!)}`)!.members.fetch()).forEach(m => {
                if (m.permissions.has(c.data.permissions)) {
                    permissions[c.data.name].push({
                        id: m.id,
                        type: 'USER',
                        permission: true
                    })
                }
            })
        }

        appCommands.push(data)
    }

    console.log(permissions)

    let setCommands = await bot.guilds.cache.get(`${BigInt(process.env.BOT_GUILD!)}`)?.commands.set(appCommands)!
    for (let sc of setCommands) {
        sc[1].setPermissions(permissions[sc[1].name])
    }

    setTimeout(() => {
        bot.guilds.cache.forEach(guild => {
            guild.fetchInvites().then(guildInvites => {
                invites[guild.id] = guildInvites
            })
        })
    }, 1000)
})

// Handle Messages
bot.on('message', (message: Discord.Message) => {
    if (message.channel.type === 'dm' || message.channel.type === 'news')
        return

    if (message.author.bot)
        return

    Database.generateXP(message.author.id)

    if (message.attachments.size > 0 || message.content.indexOf('http://') !== -1 || message.content.indexOf('https://') !== -1) {
        message.react('👍').then(() => message.react('📌'))
    }
})

bot.on('interaction', async interaction => {
    if (!interaction.isCommand()) return;

    let ephemeral: boolean = false
    if (interaction.options.get('hidden') != undefined) {
        ephemeral = interaction.options.get('hidden')!.value as boolean
    }

    await interaction.defer({ ephemeral: ephemeral })
    Database.findUser(interaction.user.id).then(dbUser => {
        if (dbUser.muted) {
            interaction.deleteReply()
            return
        }

        let found = false
        for (let c of commands) {
            if (found)
                break

            found = c.run(interaction, dbUser, bot.guilds.cache.get(`${BigInt(process.env.BOT_GUILD!)}`)?.members.cache.find(m => m.user === interaction.user)!)
        }

        if (!found) {
            interaction.deleteReply()
        } else {
            Database.incrementInfo(interaction.user.id, 'commands')
        }
    }).catch(err => Logger.error(interaction.user.id, 'Database.findUser', err))
})

// Handle Reaction being Added
bot.on('messageReactionAdd', async (reaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser) => {
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

    if (user.bot)
        return

    Database.findUser(reaction.message.author!.id).then(async dbUser => {

        if (dbUser.muted) {
            reaction.users.remove(user as Discord.User)
            return
        }

        const users = await reaction.users.fetch()
        Logger.log(user.id, `${reaction.emoji.name} on ${reaction.message.id}`, 'Ran MessageReactionAdd')

        if (reaction.emoji.name === '📌') {
            reaction.users.remove(user as Discord.User)
            user.send(`${reaction.message.author} **sent:**\n${reaction.message.content}\n\n**viewable here:**\n${reaction.message.url}`).then((m) => m.react('🗑️'))
        } else if (reaction.emoji.name === '🗑️' && reaction.message.author === bot.user && reaction.message.channel.type === "dm") {
            if (reaction.message.deletable)
                reaction.message.delete().catch(err => Logger.error(user.id, 'Reaction Delete', err));
            else {
                reaction.message.reply("Couldn't delete message.").then((m) => setTimeout(() => { m.delete() }, 5000))
            }
        } else if (users.has(bot.user!.id)) {
            if (reaction.emoji.name === '◀' || reaction.emoji.name === '▶' || reaction.emoji.name === '👍' || reaction.emoji.name === '📌' || reaction.emoji.name === '❓') {
                switch (reaction.emoji.name) {
                    case '◀':
                        break;

                    case '▶':
                        break;

                    case '👍':
                        Database.addXP(reaction.message.author!.id, 5)
                        break;

                    case '❓':
                        break;
                }
            } else {
                Database.findAssigner(reaction.message.id).then(a => {
                    let assigner = new Assigner({ title: a.title, description: a.description, reactionRoles: a.reactionRoles, id: a.id })
                    assigner.assignRole(bot, reaction.message as Discord.Message, reaction, user as Discord.User)
                }).catch(err => Logger.error(user.id, 'Database.findAssigner', err))
            }
        } else {
            Database.addXP(reaction.message.author!.id, 1)
        }
    }).catch(err => Logger.error(reaction.message.author!.id, 'Database.findUser', err))
})

// Handle Discord User Joining Server
bot.on('guildMemberAdd', (member: Discord.GuildMember) => {
    Logger.log(member.id, `${member.id} Joined Server`, 'Ran GuildMemberAdd')
    let channel = bot.guilds.cache.find(g => g.id === '619560877405896714')?.channels.cache.find(c => c.id === '619560877405896716') as Discord.TextChannel
    channel.send(`Welcome ${member.user} to the\n**Sheridan SDNE Discord!**\nMake sure to assign your role in <#704216085444165682>`)
    member.guild.fetchInvites().then(guildInvites => {
        const existingInvites: Discord.Collection<string, Discord.Invite> = invites[member.guild.id]
        invites[member.guild.id] = guildInvites
        const invite = guildInvites.find(i => existingInvites.get(i.code)?.uses! < i.uses!)
        Database.setReferrer(member.id, invite!.inviter!.id)
        Database.addXP(invite!.inviter!.id, 15)
        // console.log(`Joined ${member.id}, Referrer: ${invite?.inviter?.id!}`)
    })
})

// Handle new Invite being created
bot.on('inviteCreate', (invite: Discord.Invite) => {
    Logger.log(invite.inviter!.id, 'User Created Invite', 'Ran InviteCreate')
    invite.guild?.fetchInvites().then(guildInvites => {
        invites[invite.guild!.id] = guildInvites
    })
})

// Handle Message being Edited
bot.on('messageUpdate', async (message: Discord.Message | Discord.PartialMessage) => {
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

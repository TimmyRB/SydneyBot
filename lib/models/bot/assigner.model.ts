/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Bot Model of an Assigner
 * @author Jacob Brasil
 *
 * Created at     : 2021-01-30 17:33:40 
 * Last modified  : 2021-01-30 17:33:58
 */

import { Client, DMChannel, EmbedField, EmojiResolvable, Guild, Message, MessageEmbed, MessageReaction, NewsChannel, Role, TextChannel, User } from 'discord.js';
import { Database } from '../../database/database';
import { Logger } from '../../database/logger';

export default class Assigner {
    id: string;
    title: string;
    description: string;
    reactionRoles: { groupId: number, name: string, emoji: EmojiResolvable, roleId: string }[];
    welcomeChannelId: string | undefined;

    /**
     * Create new Assigner
     * @param title Assigner Title
     * @param description Assigner Description
     * @param reactionRoles Roles that can be assigned
     * @param id id of the sent Assigner Message
     * @param welcomeChannelId id of a welcome channel to send when a new user assigns roles
     */
    constructor(title?: string, description?: string, reactionRoles?: { groupId: number, name: string, emoji: EmojiResolvable, roleId: string }[], id?: string, welcomeChannelId?: string) {
        if (id)
            this.id = id
        else
            this.id = '0'

        if (title)
            this.title = title
        else
            this.title = ''

        if (reactionRoles)
            this.reactionRoles = reactionRoles
        else
            this.reactionRoles = []

        if (description)
            this.description = description
        else
            this.description = ''

        if (welcomeChannelId)
            this.welcomeChannelId = welcomeChannelId
    }

    /**
     * Show Assigner Embed
     * @param channel channel to send it to
     * @param uuid uuid of the user requesting the Assigner
     */
    show(channel: TextChannel | DMChannel | NewsChannel, uuid: string) {
        let fields: EmbedField[] = []

        this.reactionRoles.forEach(rRole => {
            fields.push({
                name: rRole.emoji.toString(),
                value: rRole.name,
                inline: true
            })
        })

        let embed: MessageEmbed = new MessageEmbed({
            title: this.title,
            description: this.description,
            fields: fields
        })

        channel.send(embed).then(msg => {
            Database.createAssigner(msg.id, uuid, this.title, this.description, this.reactionRoles)
            this.reactionRoles.forEach(async rRole => {
                await msg.react(rRole.emoji)
            })
        })
    }

    /**
     * Assign a Role to the User
     * @param bot the bot client
     * @param message the message reacted to
     * @param reaction the reaction that the user reacted with
     * @param user the user who reacted
     */
    assignRole(bot: Client, message: Message, reaction: MessageReaction, user: User) {
        if (this.id === '0')
            return

        if (message.id !== this.id)
            return

        let foundReactRole = this.reactionRoles.find(e => e.emoji.toString() == reaction.emoji.toString())
        let foundRole = bot.guilds.cache.find(g => g.id === process.env.BOT_GUILD)?.roles.cache.find(r => r.id === foundReactRole?.roleId)

        let removeRoles: Role[] = []

        this.reactionRoles.forEach(rRole => {
            let r

            if (foundReactRole?.groupId === 0) {
                r = bot.guilds.cache.find(g => g.id === process.env.BOT_GUILD)?.roles.cache.find(r => (r.id === rRole?.roleId))
            } else {
                r = bot.guilds.cache.find(g => g.id === process.env.BOT_GUILD)?.roles.cache.find(r => (r.id === rRole?.roleId) && (rRole.groupId === foundReactRole?.groupId || rRole.groupId === 0))
            }

            if (r != undefined)
                removeRoles.push(r)
        })

        if (foundReactRole === undefined || foundRole === undefined || removeRoles.length === 0)
            return

        bot.guilds.cache.find(g => g.id === process.env.BOT_GUILD)?.members.fetch().then(members => {
            let member = members.find(m => m.user === user)
            let firstRole = member?.roles.cache.size === 1

            member?.roles.remove(removeRoles).then(() => {
                member?.roles.add(foundRole!).then(() => {
                    reaction.users.remove(user).then(() => {
                        if (firstRole && this.welcomeChannelId !== undefined) {
                            let channel = bot.guilds.cache.find(g => g.id === process.env.BOT_GUILD)?.channels.cache.find(c => c.id === this.welcomeChannelId) as TextChannel
                            channel.send(`Welcome ${user} to the\n**Sheridan SDNE Discord!**`)
                        }
                    }).catch(err => Logger.error(user.id, 'reaction.users.remove', err))
                }).catch(err => Logger.error(user.id, 'member.roles.add', err))
            }).catch(err => Logger.error(user.id, 'member.roles.remove', err))
        }).catch(err => Logger.error(user.id, 'members.fetch', err))
    }
}

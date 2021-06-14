/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Bot Model of an Assigner
 * @author Jacob Brasil
 *
 * Created at     : 2021-01-30 17:33:40 
 * Last modified  : 2021-01-30 21:17:36
 */

import { Client, DMChannel, EmbedField, EmojiResolvable, Message, MessageEmbed, MessageReaction, NewsChannel, Role, TextChannel, User } from 'discord.js';
import { Database } from '../../database/database';
import { Logger } from '../../database/logger';

interface AssignerOptions {
    /** id of the Discord Message that is an Assigner */
    id?: string;

    /** Title of the Embed */
    title?: string;

    /** Description of the Embed */
    description?: string;

    /** Roles to be assigned based on reaction */
    reactionRoles?: {
        /** Roles of the same GroupId will override eachother, groupId of 0 will overwrite every other group */
        groupId: number,
        /** Name of role shown in Embed */
        name: string,
        /** Emoji that will assign role when reacted to */
        emoji: string,
        /** Id of the Role to assign to the reactor */
        roleId: string
    }[];
}

export class Assigner {
    data?: AssignerOptions;

    /**
     * Create new Assigner
     * @param data Data to create assigner with
     */
    constructor(data?: AssignerOptions) {
        if (data)
            this.data = data
    }

    /**
     * Show Assigner Embed
     * @param channel channel to send it to
     * @param uuid uuid of the user requesting the Assigner
     */
    show(channel: TextChannel | DMChannel | NewsChannel, uuid: string) {
        let fields: EmbedField[] = []

        this.data?.reactionRoles?.forEach(rRole => {
            fields.push({
                name: rRole.emoji.toString(),
                value: rRole.name,
                inline: true
            })
        })

        let embed: MessageEmbed = new MessageEmbed({
            title: this.data?.title,
            description: this.data?.description,
            fields: fields
        })

        channel.send({ embeds: [embed] }).then(msg => {
            Database.createAssigner(msg.id, uuid, this.data?.title!, this.data?.description!, this.data?.reactionRoles!)
            this.data?.reactionRoles?.forEach(async rRole => {
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
        if (this.data?.id === '0')
            return

        if (message.id !== this.data?.id)
            return

        let foundReactRole = this.data?.reactionRoles?.find(e => e.emoji.toString() == reaction.emoji.toString())
        let foundRole = bot.guilds.cache.find(g => g.id === process.env.BOT_GUILD)?.roles.cache.find(r => r.id === foundReactRole?.roleId)

        let removeRoles: Role[] = []

        this.data?.reactionRoles?.forEach(rRole => {
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
                    reaction.users.remove(user).catch(err => Logger.error(user.id, 'reaction.users.remove', err))
                }).catch(err => Logger.error(user.id, 'member.roles.add', err))
            }).catch(err => Logger.error(user.id, 'member.roles.remove', err))
        }).catch(err => Logger.error(user.id, 'members.fetch', err))
    }
}

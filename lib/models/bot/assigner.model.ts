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

import { APIMessage, ButtonInteraction, Client, CommandInteraction, Message, MessageActionRow, MessageButton, MessageButtonStyle, MessageEmbed, MessageReaction, Role, User } from 'discord.js';
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
        roleId: string,
        /** Style of button */
        style: MessageButtonStyle
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
    show(interaction: CommandInteraction) {

        let embed: MessageEmbed = new MessageEmbed({
            title: this.data?.title,
            description: this.data?.description
        })

        let rows: MessageActionRow[] = [];
        for (let r of this.data?.reactionRoles!) {
            if (r.groupId + 1 > rows.length)
                rows.push(new MessageActionRow())

            let row = rows[r.groupId]
            row.addComponents([new MessageButton({ style: r.style, customID: r.roleId, label: r.name, emoji: r.emoji })])
        }

        interaction.editReply({ embeds: [embed], components: rows }).then(msg => {
            Database.createAssigner(msg.id, interaction.user.id, this.data?.title!, this.data?.description!, this.data?.reactionRoles!)
        }).catch(err => console.error(err))
    }

    /**
     * Assign a Role to the User
     * @param bot the bot client
     * @param message the message reacted to
     * @param reaction the reaction that the user reacted with
     * @param user the user who reacted
     */
    assignRole(bot: Client, interaction: ButtonInteraction) {
        if (this.data?.id === '0')
            return

        if (interaction.message.id !== this.data?.id)
            return

        let foundRole = bot.guilds.cache.find(g => g.id === process.env.BOT_GUILD)?.roles.cache.find(r => r.id === interaction.customID)
        let foundReactRole = this.data?.reactionRoles?.find(e => foundRole?.name.indexOf(e.name) !== -1)

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

        if (foundReactRole === undefined || foundRole === undefined)
            return

        bot.guilds.cache.find(g => g.id === process.env.BOT_GUILD)?.members.fetch().then(members => {
            let member = members.find(m => m.user === interaction.user)

            let rolesSnap = member?.roles.cache

            let embed = new MessageEmbed({
                title: `Role Change`,
                color: foundRole!.color,
                fields: [{
                    name: 'Added:',
                    value: `\`\`\`${foundRole!.name} \`\`\``
                }]
            })

            member?.roles.remove(removeRoles).then(() => {
                rolesSnap = rolesSnap?.filter(r => !member?.roles.cache.has(r.id)!)
                embed.addField('Removed:', `\`\`\`${rolesSnap?.map(r => r.name).join(', ')} \`\`\``)
                member?.roles.add(foundRole!).then(() => {
                    interaction.reply({ embeds: [embed], ephemeral: true })
                }).catch(err => console.error(err))
            }).catch(err => console.error(err))
        }).catch(err => console.error(err))
    }
}

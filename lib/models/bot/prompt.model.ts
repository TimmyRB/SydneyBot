/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Bot Model of a Prompt
 * @author Jacob Brasil
 *
 * Created at     : 2021-01-30 17:34:23 
 * Last modified  : 2021-01-30 17:34:41
 */

import { MessageEmbed, TextChannel, Message, DMChannel, NewsChannel } from 'discord.js'
import { Database } from '../../database/database';

export default class Prompt {
    id: string;
    page: number;
    totalPages: number;
    content: MessageEmbed[];

    /**
     * Creates new Prompt
     * @param content array of Embeds that act as pages
     * @param id id of the sent Discord Message
     * @param page current page index
     * @param totalPages total pages
     */
    constructor(content: MessageEmbed[], id?: string, page?: number, totalPages?: number) {
        if (id)
            this.id = id
        else
            this.id = '0'

        if (page)
            this.page = page
        else
            this.page = 0

        if (totalPages)
            this.totalPages = totalPages
        else
            this.totalPages = 1

        this.content = content
    }

    /**
     * Show prompt
     * @param channel the channel to send to prompt to
     * @param uuid uuid of the user requesting the prompt
     */
    show(channel: TextChannel | DMChannel | NewsChannel, uuid: string) {
        channel.send(this.content[0]).then(message => {
            Database.createPrompt(message.id, this.content, uuid)

            if (this.content.length > 1) {
                message.react('◀').then(() => message.react('▶'))
            }
        })
    }

    /**
     * Increase the page index
     * @param message the prompt as a Discord Message
     */
    nextPage(message: Message) {
        if (this.id === '0')
            return

        if (message.id !== this.id)
            return

        if (this.page + 1 > this.totalPages)
            return

        this.page++;
        message.edit(this.content[this.page])
        Database.nextPage(this.id, message.author.id)
    }

    /**
     * Decrease the page index
     * @param message the prompt as a Discord Message
     */
    previousPage(message: Message) {
        if (this.id === '0')
            return

        if (message.id !== this.id)
            return

        if (this.page - 1 < 0)
            return

        this.page--;
        message.edit(this.content[this.page])
        Database.previousPage(this.id, message.author.id)
    }
}

/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Bot Model of a Prompt
 * @author Jacob Brasil
 *
 * Created at     : 2021-01-30 17:34:23 
 * Last modified  : 2021-01-30 21:19:32
 */

import { MessageEmbed, TextChannel, Message, DMChannel, NewsChannel } from 'discord.js'
import { Database } from '../../database/database';

interface PromptOptions {
    /** id of the Discord Message that is a Prompt */
    id?: string;

    /** Current page index */
    page?: number;

    /** Total Pages available */
    totalPages?: number;

    /** Array of Embeds to serve as pages */
    content: MessageEmbed[];
}

export class Prompt {
    data: PromptOptions

    /**
     * Create new Prompt
     * @param data Data to create prompt with
     */
    constructor(data: PromptOptions) {
        this.data = data
    }

    /**
     * Show prompt
     * @param channel the channel to send to prompt to
     * @param uuid uuid of the user requesting the prompt
     */
    show(channel: TextChannel | DMChannel | NewsChannel, uuid: string) {
        channel.send(this.data.content[0]).then(message => {
            Database.createPrompt(message.id, this.data.content, uuid)

            if (this.data.content.length > 1) {
                message.react('◀').then(() => message.react('▶'))
            }
        })
    }

    /**
     * Increase the page index
     * @param message the prompt as a Discord Message
     */
    nextPage(message: Message) {
        if (this.data.id === '0')
            return

        if (message.id !== this.data.id)
            return

        if (this.data.page! + 1 > this.data.totalPages!)
            return

        this.data.page!++;
        message.edit(this.data.content[this.data.page!])
        Database.nextPage(this.data.id, message.author.id)
    }

    /**
     * Decrease the page index
     * @param message the prompt as a Discord Message
     */
    previousPage(message: Message) {
        if (this.data.id === '0')
            return

        if (message.id !== this.data.id)
            return

        if (this.data.page! - 1 < 0)
            return

        this.data.page!--;
        message.edit(this.data.content[this.data.page!])
        Database.previousPage(this.data.id, message.author.id)
    }
}

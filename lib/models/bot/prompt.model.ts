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

import { MessageEmbed, TextChannel, Message, DMChannel, NewsChannel, CommandInteraction } from 'discord.js'
import { Database } from '../../database/database';

interface PromptOptions {
    /** id of the Discord Message that is a Prompt */
    id?: string;

    /** Current page index */
    page?: number;

    /** Total Pages available */
    totalPages?: number;

    /** Array of Embeds to serve as pages */
    content: MessageEmbed;
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
    show(interaction: CommandInteraction, uuid: string) {
        interaction.followUp({ embeds: [this.data.content], ephemeral: false }).then(message => {
            Database.createPrompt(message.id, this.data.content, uuid)
        })
    }
}

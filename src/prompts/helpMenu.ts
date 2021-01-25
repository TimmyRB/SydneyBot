import { MessageEmbed } from "discord.js";
import Prompt from "../../lib/models/bot/prompt.model";

export const HelpMenu = new Prompt([
    new MessageEmbed({
        title: 'Page 1'
    }),
    new MessageEmbed({
        title: 'Page 2'
    }),
    new MessageEmbed({
        title: 'Page 3'
    })
])
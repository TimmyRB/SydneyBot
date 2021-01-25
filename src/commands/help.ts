import { TextChannel } from 'discord.js'
import Command from '../../lib/models/bot/command.model';
import { HelpMenu } from '../prompts';

export const Help = new Command('help', [], (message, args, dbUser) => {
    HelpMenu.show(message.channel as TextChannel)
})
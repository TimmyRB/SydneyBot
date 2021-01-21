import Command from "../models/bot/command.model";

export const Slurp = new Command('Slurp', [], [], (message, options) => {
    message.reply('Slap!')
})
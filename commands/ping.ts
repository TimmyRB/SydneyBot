import Command from "../models/bot/command.model";

export const Ping = new Command('ping', [], [], (message, options) => {
    message.reply('Pong!')
})
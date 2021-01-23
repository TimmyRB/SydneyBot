import Command from '../../lib/models/bot/command.model';

export const Ping = new Command('ping', [], (message, args) => {
    message.reply('Pong!')
})
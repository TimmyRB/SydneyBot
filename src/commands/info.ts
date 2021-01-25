import { Database } from '../../lib/database/database';
import Command from '../../lib/models/bot/command.model';

export const Info = new Command('info', [], (message, args, dbUser) => {
    if (message.mentions.members) {
        message.mentions.members?.forEach(member => {
            Database.findUser(member.id).then(menUser => {
                message.channel.send(JSON.stringify(menUser.toJSON()))
            })
        })
    } else {
        message.channel.send(JSON.stringify(dbUser.toJSON()))
    }
})
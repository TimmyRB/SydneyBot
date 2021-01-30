import { Permissions, TextChannel } from 'discord.js'
import Assigner from '../../lib/models/bot/assigner.model';
import Command from '../../lib/models/bot/command.model';

export const AssignEmbed = new Command('assignembed', 'Creates a Role Assignment Embed', '!assignEmbed', new Permissions('MANAGE_ROLES'), (message, args, dbUser) => {
    let roleAssigner = new Assigner('Role Assignment Info', 'Click a corresponding reaction to set your year & campus and gain access to the other channels!', [
        {
            groupId: 0,
            name: 'Prospective Student',
            emoji: '🔮',
            roleId: '788394400715767808'
        },
        {
            groupId: 1,
            name: '1st Year',
            emoji: '📗',
            roleId: '619581998574469120'
        },
        {
            groupId: 1,
            name: '2nd Year',
            emoji: '📘',
            roleId: '619582112936362020'
        },
        {
            groupId: 1,
            name: '3rd Year',
            emoji: '📙',
            roleId: '619582159899852802'
        },
        {
            groupId: 1,
            name: 'Alumni',
            emoji: '🧾',
            roleId: '619582173522952233'
        },
        {
            groupId: 2,
            name: 'Trafalgar',
            emoji: '1️⃣',
            roleId: '620641262101463070'
        },
        {
            groupId: 2,
            name: 'Davis',
            emoji: '2️⃣',
            roleId: '620641321908043798'
        }
    ], '0', '619560877405896716')

    roleAssigner.show(message.channel, message.author.id)
    message.delete()
})
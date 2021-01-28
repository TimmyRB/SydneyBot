import { TextChannel } from 'discord.js'
import Assigner from '../../lib/models/bot/assigner.model';
import Command from '../../lib/models/bot/command.model';

export const AssignEmbed = new Command('assignembed', [], (message, args, dbUser) => {
    let roleAssigner = new Assigner('Role Assignment Info', 'Click a corresponding reaction to set your year & campus and gain access to the other channels!', [
        {
            groupId: 0,
            name: 'Prospective Student',
            emoji: '🔮',
            roleId: '803857268868251665'
        },
        {
            groupId: 1,
            name: '1st Year',
            emoji: '📗',
            roleId: '803857268868251666'
        },
        {
            groupId: 1,
            name: '2nd Year',
            emoji: '📘',
            roleId: '803857268868251667'
        },
        {
            groupId: 1,
            name: '3rd Year',
            emoji: '📙',
            roleId: '803857269107982366'
        },
        {
            groupId: 1,
            name: 'Alumni',
            emoji: '🧾',
            roleId: '803857269107982367'
        },
        {
            groupId: 2,
            name: 'Trafalgar',
            emoji: '1️⃣',
            roleId: '803857268868251664'
        },
        {
            groupId: 2,
            name: 'Davis',
            emoji: '2️⃣',
            roleId: '803857268868251663'
        }
    ])

    roleAssigner.show(message.channel as TextChannel)
    message.delete()
})
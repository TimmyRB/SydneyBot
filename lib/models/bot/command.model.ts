import { Permissions, Message, GuildMember, BitFieldResolvable, PermissionString } from 'discord.js';
import { Logger } from '../../database/logger';
import * as databaseModels from '../database'

export default class Command {
  name: string;
  permissions: Permissions;
  private callback: (message: Message, args: string[], dbUser: databaseModels.Users) => void;
  exampleRun: string;
  desc: string;

  /**
   * Creates a new Command
   * @param name Name of the command, also how the command will be called
   * @param desc Breif description of what the command does
   * @param exampleRun String of how to run the command
   * @param permissions Permissions that the message author needs to have
   * @param callback Provides parsed Options, Original message object, and the User from the Database
   */
  constructor(name: string, desc: string, exampleRun: string, permissions: Permissions, callback: (message: Message, args: string[], dbUser: databaseModels.Users) => void) {
    this.name = name.toLowerCase();
    this.desc = desc;
    this.exampleRun = exampleRun;
    this.permissions = permissions;
    this.callback = callback;
  }

  private verifyPermissions(member: GuildMember | null) {
    if (member === null)
      return false

    let missingPermissions: Permissions = new Permissions();
    this.permissions.toArray().forEach(permission => {
      if (!member?.hasPermission(permission))
        missingPermissions.add(permission)
    })
    return missingPermissions
  }

  run(message: Message, dbUser: databaseModels.Users): boolean {
    let args = message.content.trim().toLowerCase().slice(1).split(' ')
    let command = args.shift()

    if (command !== this.name) {
      return false
    }

    let missingPermissions = this.verifyPermissions(message.member)
    if (!missingPermissions || missingPermissions.toArray().length > 0) {
      message.react('❓')
      return false
    }

    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith('<') && args[i].endsWith('>'))
        args.splice(i, 1)
    }

    this.callback(message, args, dbUser)
    Logger.log(message.author.id, `!${this.name}`, 'Ran Command')
    return true
  }
}

/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Bot Model of a Command
 * @author Jacob Brasil
 *
 * Created at     : 2021-01-30 17:34:02 
 * Last modified  : 2021-01-30 21:13:09
 */

import { Permissions, Message, GuildMember } from 'discord.js';
import { Logger } from '../../database/logger';
import * as databaseModels from '../database'

interface CommandOptions {
  /** Name of command, also how command will be run */
  name: string;

  /** Description of command in help menu */
  desc: string;

  /** Usage of command shown in help menu */
  usage: string;

  /** Permissions required to run command */
  permissions: Permissions;

  /**
   * Callback to run once args are parsed & user is returned from Database
   * @param message original message object sent by user
   * @param args parsed arguments from message, GuildMember & Channel mentions are removed from args
   * @param dbUser user returned from Database
   */
  callback: (message: Message, args: string[], dbUser: databaseModels.Users) => void;
}

export class Command {
  data: CommandOptions

  /**
   * Create new Command
   * @param data Data to create command with
   */
  constructor(data: CommandOptions) {
    this.data = data
  }

  /**
   * Checks if GuildMember has command's permissions
   * @param member the GuildMember to check agaisnt
   */
  private verifyPermissions(member: GuildMember | null): false | Permissions {
    if (member === null)
      return false

    let missingPermissions: Permissions = new Permissions();
    this.data.permissions.toArray().forEach(permission => {
      if (!member?.hasPermission(permission))
        missingPermissions.add(permission)
    })
    return missingPermissions
  }

  /**
   * Run the command
   * @param message message where the command was called
   * @param dbUser the user from the Database
   */
  run(message: Message, dbUser: databaseModels.Users): boolean {
    let args = message.content.trim().toLowerCase().slice(1).split(' ')
    let command = args.shift()

    if (command !== this.data.name) {
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

    this.data.callback(message, args, dbUser)
    Logger.log(message.author.id, `!${this.data.name}`, 'Ran Command')
    return true
  }
}

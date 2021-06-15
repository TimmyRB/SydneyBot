/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Bot Model of a Command
 * @author Jacob Brasil
 *
 * Created at     : 2021-01-30 17:34:02 
 * Last modified  : 2021-01-30 21:44:01
 */

import { Permissions, GuildMember, ApplicationCommandOption, CommandInteraction, Collection, CommandInteractionOption } from 'discord.js';
import { Logger } from '../../database/logger';
import * as databaseModels from '../database'

interface CommandOptions {
  /** Name of command, also how command will be run */
  name: string;

  /** Description of command in help menu */
  desc: string;

  /** Input Field Options */
  options: ApplicationCommandOption[]

  /** Permissions required to run command */
  permissions: Permissions;

  /**
   * Callback to run once args are parsed & user is returned from Database
   * @param message original message object sent by user
   * @param args parsed arguments from command
   * @param dbUser user returned from Database
   */
  callback: (message: CommandInteraction, args: Collection<string, CommandInteractionOption>, dbUser: databaseModels.Users) => void;
}

export class Command {
  data: CommandOptions

  /**
   * Create new Command
   * @param data Data to create command with
   */
  constructor(data: CommandOptions) {
    data.name = data.name.toLowerCase()
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
      if (!member?.permissions.has(permission))
        missingPermissions.add(permission)
    })
    return missingPermissions
  }

  /**
   * Run the command
   * @param message message where the command was called
   * @param dbUser the user from the Database
   */
  run(interaction: CommandInteraction, dbUser: databaseModels.Users, member: GuildMember): boolean {

    if (interaction.commandName !== this.data.name) {
      return false
    }

    let missingPermissions = this.verifyPermissions(member)
    if (!missingPermissions || missingPermissions.toArray().length > 0) {
      return false
    }

    let r = this.data.callback(interaction, interaction.options, dbUser)
    Logger.log(interaction.user.id, `!${this.data.name}`, 'Ran Command')

    return true
  }
}

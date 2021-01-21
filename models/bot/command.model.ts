import { Permissions, Message, GuildMember } from "discord.js";

export default class Command {
  name: String;
  private options: [{ name: string; type: string | number; required: boolean; }?];
  permissions: Permissions[];
  private callback: (message: Message, options: [{ key: string, value: string | number }?]) => void;


  /**
   * 
   * @param name Name of the command, also how the command will be called
   * @param options Options that need to be parsed and returned from the user's message
   * @param permissions Permissions that the message author needs to have
   * @param callback Provides parsed Options, Original message object, and the User from the Database
   */
  constructor(name: String, options: [{ name: string, type: string | number, required: boolean }?], permissions: Permissions[], callback: (message: Message, options: [{ key: string, value: string | number }?]) => void) {
    this.name = name.toLowerCase();
    this.options = options;
    this.permissions = permissions;
    this.callback = callback;
  }

  private verifyPermissions(member: GuildMember | null) {
    if (member === null)
      return false

    let missingPermissions: Permissions[] = [];
    this.permissions.forEach(permission => {
      if (!member?.hasPermission(permission))
        missingPermissions.push(permission)
    })
    return missingPermissions
  }

  run(message: Message): boolean {
    let content = message.content.trim().toLowerCase()
    let cNameIndex = (content.indexOf(' ') !== -1 ? content.indexOf(' ') : content.length)
    if (content.substring(1, cNameIndex) !== this.name) {
      console.log(`Command didn\'t match: ${content.substring(1, cNameIndex)}`)
      return false
    }

    let missingPermissions = this.verifyPermissions(message.member)
    if (!missingPermissions || missingPermissions.length > 0) {
      console.log('Missing Permissions')
      message.react('❓')
      return false
    }

    this.callback(message, [])
    return true
  }
}

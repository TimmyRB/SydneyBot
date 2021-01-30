import * as databaseModels from '../models/database'
import { MessageEmbed, EmojiResolvable } from 'discord.js'
import { Logger } from './logger'
const Users = databaseModels.Users
const Prompts = databaseModels.Prompts
const Assigners = databaseModels.Assigners

type InfoType = 'commands' | 'messages' | 'warns'

export class Database {

  /**
   * Generates random XP and adds it to the Database User
   * @param uuid uuid of the Discord User
   */
  static generateXP(uuid: string): void {
    Users.findOrCreate({ where: { uuid: uuid } }).then(data => {
      if (data[1]) {
        let newXp = parseInt(data[0].xp.toString(), 10) + Math.floor(Math.random() * (25 - 5 + 1)) + 5
        Users.update(
          { xp: newXp, xpLastUpdated: Date.now() }, { where: { uuid: uuid } }).catch(err => Logger.error(uuid, 'generateXP Users.update', err))
        return
      }

      if (Date.now() >= new Date(data[0].xpLastUpdated.getTime() + 1 * 60000).getTime()) {
        let newXp = parseInt(data[0].xp.toString(), 10) + Math.floor(Math.random() * (25 - 5 + 1)) + 5
        Users.update(
          { xp: newXp, xpLastUpdated: Date.now() }, { where: { uuid: uuid } }).catch(err => Logger.error(uuid, 'generateXP Users.update', err))
      }
    }).catch(err => Logger.error(uuid, 'generateXP Users.findOrCreate', err))
  }

  /**
   * Add a specified amount of XP to a Database User
   * @param uuid uuid of the Discord User
   * @param xp XP to add to the Database User
   */
  static addXP(uuid: string, xp: number): void {
    Users.findOrCreate({ where: { uuid: uuid } }).then(data => {
      let newXp = parseInt(data[0].xp.toString(), 10) + Math.floor(xp)
      Users.update(
        { xp: newXp }, { where: { uuid: uuid } }).catch(err => Logger.error(uuid, 'addXP Users.update', err))
    }).catch(err => Logger.error(uuid, 'addXP Users.findOrCreate', err))
  }

  /**
   * Update a specified type of info on a Database User
   * @param uuid uuid of the Discord User
   * @param type Type of info to update
   */
  static incrementInfo(uuid: string, type: InfoType) {
    switch (type) {
      case 'commands':
        Users.findOrCreate({ where: { uuid: uuid } }).then(data => {
          let newC = parseInt(data[0].commands.toString(), 10) + 1
          Users.update(
            { commands: newC }, { where: { uuid: uuid } }).catch(err => Logger.error(uuid, 'incrementInfo Users.update', err))
        }).catch(err => Logger.error(uuid, 'incrementInfo Users.findOrCreate', err))
        break;

      case 'messages':
        Users.findOrCreate({ where: { uuid: uuid } }).then(data => {
          let newM = parseInt(data[0].messages.toString(), 10) + 1
          Users.update(
            { messages: newM }, { where: { uuid: uuid } }).catch(err => Logger.error(uuid, 'incrementInfo Users.update', err))
        }).catch(err => Logger.error(uuid, 'incrementInfo Users.findOrCreate', err))
        break;

      case 'warns':
        Users.findOrCreate({ where: { uuid: uuid } }).then(data => {
          let newW = parseInt(data[0].warns.toString(), 10) + 1
          Users.update(
            { warns: newW }, { where: { uuid: uuid } }).catch(err => Logger.error(uuid, 'incrementInfo Users.update', err))
        }).catch(err => Logger.error(uuid, 'incrementInfo Users.findOrCreate', err))
        break;
    }
  }

  /**
   * Mute or Unmute a User
   * @param uuid uuid of the Discord User
   * @param muted boolean to set the User's Muted Field to
   */
  static setMuted(uuid: string, muted: boolean) {
    Users.findOrCreate({ where: { uuid: uuid } }).then(data => {
      Users.update(
        { muted: muted }, { where: { uuid: uuid } }).catch(err => Logger.error(uuid, 'setMuted Users.update', err))
    }).catch(err => Logger.error(uuid, 'setMuted Users.findOrCreate', err))
  }

  /**
   * Sets the referrer of a Database User and increments the referrer's referrals count
   * @param uuid uuid of the Discord User who got referred
   * @param referrerId uuid of the Discord User who referred
   */
  static setReferrer(uuid: string, referrerId: string) {
    Users.findOrCreate({ where: { uuid: uuid } }).then(data => {
      Users.update(
        { referrer: referrerId }, { where: { uuid: uuid } }).catch(err => Logger.error(uuid, 'setReferrer Users.update', err))
    }).catch(err => Logger.error(uuid, 'setReferrer Users.findOrCreate', err))

    Users.findOrCreate({ where: { uuid: referrerId } }).then(data => {
      let newRefs = parseInt(data[0].referrals.toString(), 10) + 1
      Users.update(
        { referrals: newRefs }, { where: { uuid: referrerId } }).catch(err => Logger.error(uuid, 'setReferrer Users.update', err))
    }).catch(err => Logger.error(uuid, 'setReferrer Users.findOrCreate', err))
  }

  /**
   * Returns a Database User from a Discord User's uuid
   * @param uuid uuid of the Discord User
   */
  static findUser(uuid: string): Promise<databaseModels.Users> {
    let promise = new Promise<databaseModels.Users>((res, rej) => {
      Users.findOrCreate({ where: { uuid: uuid } }).then(data => {
        res(data[0])
      }).catch(err => rej(err))
    })
    return promise
  }

  /**
   * Add a prompt to the Database to keep track of it
   * @param content array of Discord Embeds
   */
  static createPrompt(id: string, content: MessageEmbed[], uuid: string) {
    let unparsed: string[] = []

    content.forEach(c => {
      unparsed.push(JSON.stringify(c.toJSON()))
    })

    Prompts.create({ id: id, content: unparsed, page: 0, totalPages: content.length - 1 }).catch(err => Logger.error(uuid, 'createPrompt Prompts.create', err))
  }

  /**
   * Set a Prompt's page in the Database
   * @param id id of Prompt to change the page of
   */
  static nextPage(id: string, uuid: string) {
    Prompts.increment('page', { where: { id: id } }).catch(err => Logger.error(uuid, 'nextPage Prompts.increment', err))
  }

  /**
   * Set a Prompt's page in the Database
   * @param id id of Prompt to change the page of
   */
  static previousPage(id: string, uuid: string) {
    Prompts.update({ page: databaseModels.Sequelize.literal('page - 1') }, { where: { id: id } }).catch(err => Logger.error(uuid, 'previousPage Prompts.update', err))
  }

  /**
   * Find a Prompt from the Database and return it
   * @param id id of the Prompt to find
   */
  static findPrompt(id: string): Promise<databaseModels.Prompts> {
    let promise = new Promise<databaseModels.Prompts>((res, rej) => {
      Prompts.findByPk(id).then(data => {
        if (!data)
          rej('Prompt was null')

        for (let i = 0; i < data!.content.length; i++) {
          data!.content[i] = new MessageEmbed(JSON.parse(data!.content[i] as unknown as string))
        }

        res(data!)
      }).catch(err => rej(err))
    })

    return promise
  }

  /**
   * Add an Assigner to the Database
   * @param id id of the Assigner
   * @param title title of the Embed
   * @param description description of the Embed
   * @param reactionRoles roles to be assigned when User reacts
   */
  static createAssigner(id: string, uuid: string, title: string, description: string, reactionRoles: { groupId: number, name: string, emoji: EmojiResolvable, roleId: string }[]) {
    let unparsed: string[] = []

    reactionRoles.forEach(rRole => {
      unparsed.push(JSON.stringify(rRole))
    })

    Assigners.create({ id: id, title: title, description: description, reactionRoles: unparsed }).catch(err => Logger.error(uuid, 'createAssigner Assigners.create', err))
  }

  /**
   * Find Assigner from the Database and return it
   * @param id id to search for existing Assigner by
   */
  static findAssigner(id: string): Promise<databaseModels.Assigners> {
    let promise = new Promise<databaseModels.Assigners>((res, rej) => {
      Assigners.findByPk(id).then(data => {
        if (!data)
          rej('Assigner was null')

        for (let i = 0; i < data!.reactionRoles.length; i++) {
          data!.reactionRoles[i] = JSON.parse(data!.reactionRoles[i] as unknown as string)
        }

        res(data!)
      }).catch(err => rej(err))
    })

    return promise
  }
}

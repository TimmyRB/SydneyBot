import * as databaseModels from '../models/database'
const Users = databaseModels.Users

export class Logger {
  log(message: string) {

  }

  warn(message: string) {

  }

  error(message: string) {

  }
}

export class Database {
  static addXp(uuid: string) {
    Users.findOrCreate({ where: { uuid: uuid } }).then(data => {
      if (Date.now() > new Date(data[0].xpLastUpdated.getTime() + 1 * 60000).getTime()) {
        Users.update(
          { xp: data[0].xp + (Math.random() * 10) + 10, xpLastUpdated: Date.now() }, { where: { uuid: uuid } })
      }
    })
  }
}

import { Logs } from "../models/database";

export class Logger {
    static log(uuid: string, cause: string, result: string) {
        Logs.create({ uuid: uuid, cause: cause, result: result, type: 'log' })
    }

    static warn(uuid: string, cause: string, result: string) {
        Logs.create({ uuid: uuid, cause: cause, result: result, type: 'warn' })

    }

    static error(uuid: string, cause: string, result: string) {
        Logs.create({ uuid: uuid, cause: cause, result: result, type: 'error' })
    }
}
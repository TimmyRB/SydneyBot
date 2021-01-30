/**
 * Copyright (c) 2021 Jacob Brasil
 *
 * MIT
 *
 * @summary Logger class for logging to Database
 * @author Jacob Brasil
 *
 * Created at     : 2021-01-30 17:36:17 
 * Last modified  : 2021-01-30 17:36:34
 */

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
import { Sequelize } from 'sequelize-cockroachdb'
const env = process.env.NODE_ENV || 'development';
import { config } from '../../config/config'

const cfg = config[env]

const sequelize = new Sequelize(cfg.database!, cfg.username!, cfg.password, cfg);
sequelize.sync({ force: (env === 'development') })

export { Sequelize } from 'sequelize-cockroachdb'
export { sequelize }
export { Users } from './user.model'
export { Prompts } from './prompt.model'
export { Assigners } from './assigner.model'
export { Logs } from './log.model'
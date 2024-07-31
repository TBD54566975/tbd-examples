import log from 'loglevel'
import prefix from 'loglevel-plugin-prefix'

import { config } from './config.js'

log.setLevel(config.logLevel)

prefix.reg(log)
prefix.apply(log)

export default log
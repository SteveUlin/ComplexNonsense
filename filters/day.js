const dayjs = require('dayjs')

const defaultFormat = 'YYYY MMMM DD'

function dayFilter(date, format = defaultFormat) {
  return dayjs(date).format(format)
}

module.exports = dayFilter
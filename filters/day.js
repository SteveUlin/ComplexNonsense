const dayjs = require('dayjs')

const defaultFormat = 'YYYY MMMM DD'

module.exports = (date, format = defaultFormat) => {
  return dayjs(date).format(format);
}

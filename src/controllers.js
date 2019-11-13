const constants = require('./constants')

exports.characters = {
  handler: async (req) => {
    const characters = await req.server.plugins.db.pg.any(
      'SELECT * FROM characters'
    )
    return characters.reduce((acc, char) => {
      acc[char.name] = char.visible
      return acc
    }, {})
  }
}

exports.sendAttendeeStatus = {
  handler: async (req) => {
    req.server.plugins.ws.sendStatus(constants.ATTENDEE_STATUS)
    return { status: 'success' }
  }
}

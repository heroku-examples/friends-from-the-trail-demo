const constants = require('./constants')

exports.characters = {
  handler: async (req) => {
    return req.server.plugins.db.getCharacters()
  }
}

exports.getAttendeeApp = {
  handler: async (req) => {
    return req.server.plugins.db.getLatestApp()
  }
}

exports.sendAttendeeApp = {
  handler: async (req) => {
    const { name } = req.payload

    req.server.plugins.ws.sendStatus(constants.ATTENDEE_STATUS)
    req.server.plugins.ws.sendAttendeeApp({ name })

    await req.server.plugins.db.saveAttendeeApp({
      name
    })

    return { status: 'success' }
  }
}

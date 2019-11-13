const controllers = require('./controllers')

module.exports = [
  {
    method: 'GET',
    path: '/api/characters',
    config: controllers.characters
  },
  {
    method: 'POST',
    path: '/api/send-attendee-status',
    config: controllers.sendAttendeeStatus
  }
]

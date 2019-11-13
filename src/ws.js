const WebSocket = require('ws')
const constants = require('./constants')

const register = async (server) => {
  const wsServer = new WebSocket.Server({ server: server.listener })

  const send = (type, data) => {
    const sendData = {
      type,
      data: typeof data === 'string' ? JSON.parse(data) : data
    }
    server.log(['websocket'], sendData)
    wsServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(sendData))
      }
    })
  }

  server.expose('send', send)
  server.expose('sendStatus', (type) => send(constants.STATUS_UPDATE, { type }))
  server.expose('sendSubmission', (m) => send(constants.SUBMISSION, m))
  server.expose('sendBackgroundChange', () => send(constants.BACKGROUND_CHANGE))
  server.expose('sendCharacterChange', (m) =>
    send(constants.CHARACTER_CHANGE, m)
  )
}

exports.plugin = {
  name: 'ws',
  once: true,
  register
}

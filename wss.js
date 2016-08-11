var WSS = require('ws').Server;

module.exports = ({ port, state }) => {
  var wss = new WSS({ port });

  wss.on('connection', (socket) => {
    console.log('client');
    socket.send(state.getStatus());

    socket.on('message', (status) => {
      state.updateStatus(status);
    });
  });

  state.on('change', ({ status }) => {
    wss.clients.forEach((client) => {
      client.send(status);
    });
  });
};

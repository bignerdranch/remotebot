var WSS = require('ws').Server;
var http = require('http');
var express = require('express');

module.exports = ({ port, state, app }) => {
  app.set('view engine', 'pug');
  app.get('/', (req, res) => {
    var user = req.user;
    var authed = req.isAuthenticated();
    res.render('index', { user, authed });
  });

  app.use(express.static(__dirname + '/public'));

  var server = http.createServer(app);
  server.listen(port);

  var verifyClient = app.verifyClient;

  var wss = new WSS({
    server,
    verifyClient,
    keepAlive: {
      interval: 1000,
      timeout: 5000
    }
  });

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

  return server;
};

require('dotenv').config();

var SlackBot = require('slackbots');

var BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
var BOT_NAME = process.env.SLACK_BOT_NAME;
var BOT_HANDLE = process.env.SLACK_BOT_HANDLE;
var CHANNEL = process.env.SLACK_CHANNEL;

var bot = new SlackBot({
  token: BOT_TOKEN,
  name: BOT_NAME
});

var routes = [];
var route = (pattern, callback) => {
  routes.push({ pattern, callback });
};

var say = (message) => {
  bot.postMessageToChannel(CHANNEL, message);
};

var processMessage = data => {
  var text = data.text;
  routes.forEach(({ pattern, callback }) => {
    var match = text.match(pattern);
    if (match != null && text == match[0]) {
      callback(match, data);
    }
  });
};

bot.on('message', data => {
  if (data.type === 'message' &&
      data.username !== BOT_HANDLE) {
    processMessage(data);
  }
});

route(/.*all the (\w+).*/i, ([, thing]) => {
  say(`I don't like ${thing}.`);
});

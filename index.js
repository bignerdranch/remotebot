require('dotenv').config();

var r = RegExp;

var SlackBot = require('slackbots');
var WSS = require('./wss');
var State = require('./state');

var Promise = global.Promise;

var BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
var BOT_NAME = process.env.SLACK_BOT_NAME;
var BOT_HANDLE = process.env.SLACK_BOT_HANDLE;
var CHANNEL = process.env.SLACK_CHANNEL;

var BOT_ID, CHANNEL_ID;

var state = new State();
var statusKey = State.statusKey;
var statuses = State.statuses;

var emojis = {
  unknown: ':zzz:',
  blue: ':arrows_counterclockwise:',
  green: ':white_check_mark:',
  yellow: ':warning:',
  red: ':no_entry:'
};

var bot = new SlackBot({
  token: BOT_TOKEN,
  name: BOT_NAME
});

const port = process.env.PORT || 3000;

var wss = WSS({ port, state });

var routes = [];
var route = (pattern, callback) => {
  routes.push({ pattern, callback });
};

var say = (message, channel = CHANNEL_ID) => {
  var params = {
    icon_emoji: emojis[state.getStatus()]
  };

  bot.postMessage(channel, message, params);
};

var wait = (callback) => {
  Promise.all([
    bot.getUserId(BOT_HANDLE).then(id => { BOT_ID = id; }),
    bot.getChannelId(CHANNEL).then(id => { CHANNEL_ID = id; }),
    new Promise(resolve => { bot.on('start', resolve); })
  ]).then(callback);
};

var printStatus = (status) => {
  var emoji = emojis[status];
  var text = statusKey[status];
  return `${emoji} *${status}:* ${text[0]}.\n\n_${text[1]}_`;
};

state.on('change', ({ status }) => {
  console.log(status);
  say(`Updated status to ${printStatus(status)}`);
});

var processMessage = data => {
  var text = data.text;
  routes.some(({ pattern, callback }) => {
    var match = text.match(pattern);
    if (match != null && text == match[0]) {
      callback(match, data);
      return true;
    }
  });
};

bot.on('message', data => {
  if (data.type === 'message' &&
      data.text != null &&
      data.username !== BOT_NAME) {
    processMessage(data);
  }
});


wait(() => {
  console.log('ready!');

  var bot = `(@?remotebot|<@${BOT_ID}>)`;

  route(r(`${bot} .*status.*`, 'i'), (_, { channel }) => {
    var currentStatus = state.getStatus();

    say(`Looks like the status on the remote stream is ${printStatus(currentStatus)}`, channel);
  });

  statuses.forEach(status => {
    route(r(`${bot} ${status}(\W.*)?`, 'i'), () => {
      state.updateStatus(status);
    });
  });

  route(r(`${bot} (.*\W)?help(\W.*)?`, 'i'), (_, { user, channel }) => {
    var message =
`Hi! I’m *Remote Bot*, a distraction-free remote telepresence chatbot to let in-office folks know if the remote video feed has issues!

Here are some things I can do:\n\n`;

    var commands = [];

    commands.push(['status', 'prints out the current status of the remote stream.']);

    statuses.forEach(status => {
      var text = statusKey[status];
      var emoji = emojis[status];
      commands.push([status, `updates my status to ${emoji} *${status}*: _${text[1]}_`]);
    });

    message += commands.map(([cmd, text]) => {
      return `> \`remotebot ${cmd}\` ${text}`;
    }).join('\n');

    say("I’m here to help! I sent you a direct message.", channel);
    say(message, user);
  });

  route(r(`${bot} (.*\W)?(hi|hello|hey)(\W.*)?`, 'i'), (_, { channel }) => {
    say(`Why hello there!`, channel);
  });

  var videoSyn = [
    'audio',
    'video',
    'picture',
    'hangout',
    'call',
    'camera',
    'stream',
    'fireside'
  ];

  var qualitySyn = [
    'poor',
    'bad',
    'hard',
    'choppy',
    'robot',
    'broken',
    'cutting',
    'in and out',
    'drop(ped|ping)?',
    'stutter(ing)?'
  ];

  var v = videoSyn.join('|');
  var q = qualitySyn.join('|');

  var regex = `.*((${v}).+(${q})).*|.*((${q}).+(${v})).*`;

  route(r(regex, 'i'), (_, { user, channel }) => {
    var currentStatus = state.getStatus();

    switch (currentStatus) {
      case 'unknown':
      case 'red':
        break;
      default:
        say(`<@${user}> Are you having trouble with the remote stream? *You can alert folks* with \`@remotebot red\` and they will be notified!`, channel);
    }
  });

  route(r(`${bot}.*`, 'i'), (_, { channel }) => {
    say(`Huh? I don't follow. Try \`remotebot help\`?`, channel);
  });
});

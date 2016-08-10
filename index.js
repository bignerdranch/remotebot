require('dotenv').config();

var r = RegExp;

var SlackBot = require('slackbots');

var Promise = global.Promise;

var BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
var BOT_NAME = process.env.SLACK_BOT_NAME;
var BOT_HANDLE = process.env.SLACK_BOT_HANDLE;
var CHANNEL = process.env.SLACK_CHANNEL;

var BOT_ID, CHANNEL_ID;

var currentStatus = 'unknown';

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

var wait = (callback) => {
  Promise.all([
    bot.getUserId(BOT_HANDLE).then(id => { BOT_ID = id; }),
    bot.getChannelId(CHANNEL).then(id => { CHANNEL_ID = id; }),
    new Promise(resolve => { bot.on('start', resolve); })
  ]).then(callback);
};

var updateStatus = (status) => {
  currentStatus = status;
  var emoji = statuses[status];
  console.log(status);
  say(`<!here|@here> Updated status to *${status}* ${emoji}`);
};

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
      data.username !== BOT_NAME) {
    processMessage(data);
  }
});



var statuses = {
  unknown: ':question:',
  green: ':white_check_mark:',
  yellow: ':warning:',
  red: ':no_entry:'
};

wait(() => {
  console.log('ready!');

  var bot = `(@?remotebot|<@${BOT_ID}>)`;

  route(r(`${bot} .*status.*`, 'i'), () => {
    var emoji = statuses[currentStatus];

    say(`Looks like the status on the remote stream is *${currentStatus}* ${emoji}`);
  });

  Object.keys(statuses).forEach(status => {
    route(r(`${bot} ${status}(\W.*)?`, 'i'), () => {
      updateStatus(status);
    });
  });

  route(r(`${bot} (.*\W)?help(\W.*)?`, 'i'), () => {
    say(`I can help!`);
  });

  route(r(`${bot} (.*\W)?(hi|hello|hey)(\W.*)?`, 'i'), () => {
    say(`Why hello there!`);
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
    'stutter(ing)?'
  ];

  var v = videoSyn.join('|');
  var q = qualitySyn.join('|');

  var regex = `.*((${v}).+(${q})).*|.*((${q}).+(${v})).*`;

  route(r(regex, 'i'), (_, { user }) => {
    say(`<@${user}> Are you having trouble with the remote stream? *You can alert folks* with \`@remotebot red\` and they will be notified!`);
  });

  route(r(`${bot}.*`, 'i'), () => {
    say(`Huh? I don't follow.`);
  });
});

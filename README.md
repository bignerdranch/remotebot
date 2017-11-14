# remotebot
Distraction-free remote telepresence chatbot to let in-office folks know if the remote video feed has issues!

## The Idea
- We have all-staff meetings in Ada, like Fireside Chat.
- Since remote folks aren't in the room, when their video feed goes down, their cries in Slack might be missed.
- Remotebot drives a physical lamp on the speaker's desk. This lamp is used to communicate remote feed status to people in the room:
  - Dark: Set by `remotebot unknown`; used to indicate "no meeting happening now".
  - Flashing Blue: Someone on-site ran `remotebot blue` to request a remote viewer to update the status.
    - Solid Green: Someone remote confirmed all-good with `remotebot green`
    - Flashing Red: Someone remote is signaling the feed is dead (bad audio, bad video, or similar) with `remotebot red`
    - Solid Yellow: Someone remote has a question. They want someone on-site to check the Slack feed in `#serious-business` and ask the question.

As that hints, most Remotebot usage happens in `#serious-business`, but there are also some remotebot-specific channels:

- `#remotebot-dev`
- `#remotebot-status`
- `#remotebot-test`

As a user, you don't need to join any of those, though!


## Links
remotebot runs on **Heroku** as the app `bnr-remotebot`: https://dashboard.heroku.com/apps/bnr-remotebot

remotebot is integrated into **Slack** using a Custom Integration as a Bot user on Slack: https://bignerdranch.slack.com/services/B1ZR6A2PL

remotebot's **bot source** code lives on GitHub at: https://github.com/bignerdranch/remotebot/ (P.S. You're looking at it now.)

remotebot's **hardware source** code lives on GitHub at: https://github.com/bignerdranch/remotebot-hardware (It's a single `.ino` Arduino sketch, which you can build and flash using [inotool](http://inotool.org/).)

The bot and the hardware communicate over a WebSocket. The hardware connects to the bot using the "Big Nerd Ranch" WiFi network and waits for messages with a simple textual protocol: the bot sends the hardware the name of the color it should show.


## Help, Remotebot Is Broken!
It probably just needs a restart. If you're logged in with Heroku on the BNR org, you can run:

```
heroku ps:restart --app bnr-remotebot
```

If you have a log-in but don't have the `heroku` tool installed:

```
brew install heroku
heroku login
```

It'll ask for your email, password, and 2FA code, and then you'll be good to go. :+1:

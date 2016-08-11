const EventEmitter = require('events');

const statusKey = {
  unknown: [
    'no meeting',
    "No meeting is in progress, I’m taking a nap!"
  ],
  blue: [
    'starting meeting',
    "The meeting is ready to start, waiting for a remote nerd to confirm that the remote stream is up with `remotebot green`…"
  ],
  green: [
    'remote stream is up',
    "The remote stream is working flawlessly!"
  ],
  yellow: [
    'pending questions',
    "There are some questions from remote folks, try to answer them when you get to a good stopping point."
  ],
  red: [
    'remote stream is down',
    "The remote stream has issues, pause the meeting until the problem is fixed."
  ]
};

const statuses = Object.keys(statusKey);

const defaultStatus = statuses[0];

class State extends EventEmitter {
  constructor() {
    super();
    this.state = { status: defaultStatus };
  }

  getStatus() {
    return this.state.status;
  }

  updateStatus(status) {
    var state = this.state;

    if (state.status !== status &&
        statuses.indexOf(status) >= 0) {
      state.status = status;
      this.emit('change', this.state);
    }
  }
}

State.statusKey = statusKey;
State.statuses = statuses;
State.defaultStatus = defaultStatus;

module.exports = State;

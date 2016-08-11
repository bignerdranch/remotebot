const EventEmitter = require('events');

class State extends EventEmitter {
  constructor() {
    super();
    this.state = { status: 'unknown' };
  }

  getStatus() {
    return this.state.status;
  }

  updateStatus(status) {
    var state = this.state;

    if (state.status !== status) {
      state.status = status;
      this.emit('change', this.state);
    }
  }
}

module.exports = State;

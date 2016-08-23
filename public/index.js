var ws = new WebSocket('ws://' + location.host);
ws.onmessage = (msg) => {console.log(msg)};

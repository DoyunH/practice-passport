const http = require("http");

const server = http.createServer((req, res) => {});

// Listening Event Listener
server.on("listening", () => {
  console.log("8080포트에서 연결 중...");
});

// Error Event Listener
server.on("error", () => {
  console.log(error);
});

server.listen(8080);

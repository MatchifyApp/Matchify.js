const Matchify = require("./src");

const client = new Matchify.Client({
  Socket: {
    url: "http://localhost:3000"
  }
});

client.SocketManager.Socket.on("connect", (a) => {
  console.log("Connected", a);
})

client.Connect();

client.onAny(console.log)

client.SocketManager.Socket.onAny(console.log);

client.UserManager.Fetch("707309693449535599").then(user => {
  console.log(user);
});

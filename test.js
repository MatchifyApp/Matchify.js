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

// client.onAny(console.log)
// client.SocketManager.Socket.onAny(console.log);

client.UserManager.Fetch("707309693449535599");

setInterval(() => {
  console.clear();
  console.log({
    totalSize: client.UserManager.Cache.size,
    ListenerCount: [...client.UserManager.Cache.values()].filter(i=>i.CurrentPlaying).length
  });
}, 100);


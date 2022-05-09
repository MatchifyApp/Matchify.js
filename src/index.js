module.exports = {
  Client: require('./client/Client').Client,
  SocketManager: require('./managers/SocketManager').SocketManager,
  SocketSubscriptionManager: require('./managers/SocketSubscriptionManager').SocketSubscriptionManager,
  User: require('./structures/User').User
}
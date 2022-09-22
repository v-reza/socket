const server = require("http").createServer();
const options = {
  cors: true,
  origin: "*",
  origins: "*",
};
const io = require("socket.io")(server, options);

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  //when connect
  console.log("a user connect");
  // console.log("socket id: ", socket);

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
    // io.emit("getHa", users)
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text, images }) => {
    const user = getUser(receiverId);
    console.log("send message :", user);
    io.to(user?.socketId).emit("getMessage", {
      senderId,
      text,
      images
    });
  });

  //send message to anonymous
  socket.on("sendConversations", ({ conversationId, senderId, receiverId }) => {
    const user = getUser(receiverId);
    console.log("conversation:", user);
    io.to(user?.socketId).emit("getConversations", {
      conversationId,
      senderId,
      receiverId,
    });
  });

  socket.on("sendTest", ({ receiverId }) => {
    const user = getUser(receiverId);
    console.log("sendTest: ", user?.socketId);
    // socket.broadcast.emit("getTest", {
    //   receiverId
    // })
    io.to(user?.socketId).emit("getTest", {
      user: user,
      receiverId,
    });
  });

  socket.on("sendTyping", ({ senderId, receiverId, isTyping }) => {
    const user = getUser(receiverId);
    console.log("sendTyping: ", user);
    io.to(user?.socketId).emit("getTyping", {
      senderId,
      receiverId,
      isTyping,
    });
  });

  socket.on("sendNotifications", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    console.log("sendNotifications: ", user);
    io.to(user?.socketId).emit("getNotifications", {
      senderId,
      receiverId,
      text,
    });
    io.to(user?.socketId).emit("isNewNotifications", {
      isNew: true,
    });
  });

  socket.on("openNotifications", ({ senderId }) => {
    const user = getUser(senderId)
    io.to(user?.socketId).emit("isNewNotifications", {
      isNew: false,
    })
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("disconnect");
    removeUser(socket.id);
  });
});

server.listen(process.env.PORT || 5000);

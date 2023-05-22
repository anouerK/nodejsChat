var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require("socket.io")(server);
var Chat = require("./models/schema");
var mongoose = require("mongoose");
app.use(express.static(__dirname+'/public'));
mongoose.connect("mongodb://127.0.0.1:27017/socket")
  .then(() => {
    console.log("MongoDB connected!");
    app.listen(27017, () => console.log(`Server running on port ${27017}`));
  })
  .catch(err => console.log(err));

io.on('connection', socket => {
    //console.log('connected.');
    socket.broadcast.emit('user connected');
  
    socket.on('disconnect', () => {
        //console.log('disconnected.');
        socket.broadcast.emit('user disconnected');
      });
    socket.on("message sent", async data => {
      const message = new Chat({ pseudo: data.pseudo, message: data.message });
      await message.save();
      socket.broadcast.emit("received message", { data: message });
      
    });
  
    socket.on('typing', data => {
      socket.broadcast.emit('typing', { author: data.author });
    });

   
  });
//, {messages: await Chat.find({})}
app.get('/',async function(req,res,next){
    res.sendFile(__dirname+'/index.html');
});
app.get('/messages', async function(req, res, next) {
  try {
    const messages = await Chat.find({});
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

server.listen(3200);
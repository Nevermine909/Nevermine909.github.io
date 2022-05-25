const express = require('express');
const app = express();
const server = require('http').Server(app);
const port = 3000;
const io = require('socket.io')(server);
const user_info_array = [];

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render('room')
});

io.on('connection', socket => {
    socket.on('signup', user => {
        const isExisted = user_info_array.some(e => e.username === user.username);
        socket.userId = user.userId;

        if (isExisted) {
            return socket.emit('username_signed')
        }
        else {
            user_info_array.push(user);

            socket.emit('user_list', user_info_array);
            socket.broadcast.emit('new_user', user);
        }
    });

    socket.on('disconnect', () => {
        const index = user_info_array.findIndex(user => user.userId === socket.userId);
        user_info_array.splice(index, 1);
        io.emit('user_disconnect', socket.userId);
    })
});

server.listen(port, () => {
    console.log('Listening on port 3000');
});
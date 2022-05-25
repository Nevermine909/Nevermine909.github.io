const socket = io('/');

$('#video-call').hide();

socket.on('user_list', user_list => {
    $('#video-call').show();
    $('#sign-in').hide();

    user_list.forEach(user => {
        const {userId, username} = user;

        $('#userList').append(`<li id="${userId}">${username}</li>`);
    })

    socket.on('new_user', new_user => {
        const {userId, username} = new_user;

        $('#userList').append(`<li id="${userId}">${username}</li>`);
    });

    socket.on('user_disconnect', userId => {
        $(`#${userId}`).remove();
    });
});

socket.on('username_signed', () => {
    alert('Tên người dùng đã được đăng kí, vui lòng đăng kí tên người dùng khác');
});

function openStream() {
    const config = {audio: true, video: true}; 
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideotag, stream) {
    const video = document.getElementById(idVideotag);
    video.srcObject = stream;
    video.play();
}

const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
});
   
myPeer.on('open', id => {
    $('#my-peer').append(id),

    //sự kiện đăng kí username
    $('#btnSignUp').click(() => { 
        const username = $('#username').val();
    
        socket.emit('signup', {
            userId: id, 
            username: username
        });
    })
});

//Gọi
$('#btnCall').click(() => {
    const id = $('#remoteID').val();

    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = myPeer.call(id, stream);

        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    })
}) 

//Nhận cuộc gọi
myPeer.on('call', call => {

    openStream()
    .then(stream => {
        call.answer(stream);
        playStream('localStream', stream);

        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    })
});

//Thực hiện cuộc gọi khi nhấn vào username
$('#userList').on('click', 'li', function() {
    const id = $(this).attr('id');

    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = myPeer.call(id, stream);

        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    })
})


const socket = io()
const usernameInput = document.getElementById('usernameField')
const messageInput = document.getElementById('messageField')

socket.on('message', function(data){
    let messageDiv = document.createElement('div')
    messageDiv.style.padding = '10px'
    messageDiv.innerHTML = data.username + ' : ' + data.message.substring(data.message.indexOf(':') +1)
    if (data.userid == socket.id){
        if (data.private){
            messageDiv.style.background = 'lightcoral'
            messageDiv.style.marginLeft = '60px'
        }
        else {
            messageDiv.style.background = 'lightblue'
            messageDiv.style.marginLeft = '60px'
        }
    } else if (data.private){messageDiv.style.background = 'lightcoral'} 
    else {messageDiv.style.background = 'gray'}
    messageDiv.style.width = '300px'
    messageDiv.style.borderRadius = '0.3125rem'
    document.getElementById('messages').appendChild(messageDiv)
})

function connectAs() {
    let username = usernameInput.value.trim()
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(username)){
        usernameInput.value = ''
        return
    }
    socket.emit('connectedToServer',usernameInput.value)
    document.getElementById('connectionStatus').innerText = 'You are connected to CHAT SERVER'
    document.getElementById('connectInput').style.display = 'none'
    document.getElementById('messages').style.visibility = 'visible'
    document.getElementById('messageField').disabled = false
    document.getElementById('send_button').disabled = false
    document.getElementById('clear_button').disabled = false
}

function handleSend() {
    let data = {}
    data.message = messageInput.value
    data.username = usernameInput.value
    data.userid = socket.id
    if (data.message == '') return
    if (data.message.indexOf(':') > -1){
        data.private = true
    }
    else {data.private = false}
    socket.emit('message', data)
    messageInput.value = ''
}

function handleClear(cart_item) {
    // document.getElementById('messages').innerHTML = ""
    var div = document.getElementById(cart_item);
    while(div.firstChild){
        div.removeChild(div.firstChild);
    }
}

function handleKeyDown(event)
{
    const ENTER_KEY = 13
    if (event.keyCode === ENTER_KEY) {
        handleSend()
        return false
    }
}
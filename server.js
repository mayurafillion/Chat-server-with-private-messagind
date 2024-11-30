
const app = require('http').createServer(handler)
const io = require('socket.io')(app) //wrap server app in socket io capability
const fs = require("fs") //need to read static files
const url = require("url") //to parse url strings

const PORT = process.env.PORT || 3000
app.listen(PORT) //start server listening on PORT

const ROOT_DIR = "html" //dir to serve static files from

const MIME_TYPES = {
  css: "text/css",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "application/javascript",
  json: "application/json",
  png: "image/png",
  svg: "image/svg+xml",
  txt: "text/plain"
}

function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES["txt"]
}

let users = {}

function handler(request, response) {
  let urlObj = url.parse(request.url, true, false)
  console.log("\n============================")
  console.log("PATHNAME: " + urlObj.pathname)
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
  console.log("METHOD: " + request.method)

  let filePath = ROOT_DIR + urlObj.pathname
  if (urlObj.pathname == '/') filePath = ROOT_DIR + '/chatClient.html'

  fs.readFile(filePath, function(err, data) {
    if (err) {
      console.log("ERROR: " + JSON.stringify(err))
      response.writeHead(404)
      response.end(JSON.stringify(err))
      return
    }
    response.writeHead(200, {
      "Content-Type": get_mime(urlObj.pathname)
    })
    response.end(data)
  })
    
  
}

io.on('connection', function(socket){
  console.log('Client Connected: ' + socket.id)

  socket.on('connectedToServer', function(username){
    console.log('Connected user: ' + socket.id)
    socket.username = username
    socket.emit('connected')
    users[username] = socket.id
    console.log(users)
  })
  socket.on('message', function(data){
    console.log('Message received: ' + data.message)
    console.log('Sender ID: ' + data.userid)

    if (data.private){
      if (data.message.indexOf(',')>-1){
        let recipients = data.message.substring(0, data.message.indexOf(':'))
        recipients = recipients.split(',')
        for (let i=0; i<recipients.length; i++){
          console.log('Recipient: ' + recipients[i].trim())
          console.log('Recipient ID: ' + users[recipients[i].trim()])
          socket.to(users[recipients[i].trim()]).emit('message', data)
        }
      }
      else{
        let recipient = data.message.substring(0, data.message.indexOf(':'))
        console.log('Recipient: ' + recipient.trim())
        console.log('Recipient ID: ' + users[recipient.trim()])
        socket.to(users[recipient.trim()]).emit('message', data)
      }
      socket.emit('message', data)
    }
    else {
      data.message = data.username + ' : ' + data.message
      io.emit('message', data)
    }
  })
  socket.on('disconnect', function () {
    console.log('Client Disconnected')
    delete users[socket.username]
  })
})

console.log("Server Running at PORT: 3000  CNTL-C to quit")
console.log("To Test:")
console.log("Open several browsers at: http://localhost:3000/chatClient.html")

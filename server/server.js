const WebSocketServer = require('ws').Server
const express = require("express")
const app = express()
const fs = require('fs')
const options = {
  key: fs.readFileSync('./global/httpsKey.pem'),
  cert: fs.readFileSync('./global/httpsCert.pem')
}

const https = require("https").createServer(options, app)
const http = require("http").createServer(app)
const Global = require("./global/Global")

var wss = new WebSocketServer({
    port: Global.OutPort,
})

wss.broadcast = (data) => {
    console.log(`\n\ndata = ` , data)
    for(var i in this.clients) {
        this.clients[i].send(data);
    }
};

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log('received: %s', message);
        wss.broadcast(message);
    });
});

app.get("/", (req, res)=>{
    res.sendFile("index.html", {root: "../web/"})
})
app.get("/assets/js/rtc.js", (req, res) =>{ 
    res.sendFile("rtc.js", {root: "../web/assets/js/"})
})

https.listen(Global.Server.HTTPS_PORT, ()=>{
    console.log(`Https Server listening in ${Global.Server.HTTPS_PORT}..`)
})

http.listen(Global.Server.HTTP_PORT, ()=>{
    console.log(`Http Server listening in ${Global.Server.HTTP_PORT}..`)
})
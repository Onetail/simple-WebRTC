const WebSocket = require("ws")
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
    server: https
})


wss.broadcast = function (data) {
    this.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
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

function getIPAdress() {
    var interfaces = require('os').networkInterfaces(),
        alias,
        iface;

    for (let devName in interfaces) {　　　　
        iface = interfaces[devName];　　　
        for (var i = 0, max = iface.length ; i < max; i++) {
            alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }　　
    }
    return false
}

var ip = getIPAdress();
console.log("\n--------IP地址：" + ip+ "------\n");
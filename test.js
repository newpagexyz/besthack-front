const http = require('http');
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
    res.end('[{"text":"Юлия Якубеня уронила отварную сосиску","start":"2020-05-27","end":"2020-05-27","image":"horizontal.jpg"}]')});
server.listen(8080);
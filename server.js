const
    bodyParser = require('body-parser'),
    express = require('express');

var app = express();

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send({"message": "Hello World!"})
});

app.listen(4941, function () {
    console.log('Example app listening on container port 4941!')
})

const
    mysql = require('mysql'),
    bodyParser = require('body-parser'),
    express = require('express');

const connect = () => {
    return mysql.createConnection({
        host: process.env.SENG365_MYSQL_HOST || 'localhost',
        port: process.env.SENG365_MYSQL_PORT || 6033,
        user: 'root',
        password: 'secret',
        database: 'mysql'
    })
};

var app = express();

app.use(bodyParser.json());

app.get('/', function (req, res) {
    const con = connect();
    con.connect( (err) =>{
        if(!err) {
            console.log("Connected to the database");
            con.query('SELECT * from user', (err, rows, fields) => {
                con.end();
                if (!err) {
                    res.send(JSON.stringify(rows));
                } else {
                    console.log(err);
                    res.send({"ERROR":"Error getting users"});
                }
            });
        } else {
            console.log("Error connecting to database");
            res.send({"ERROR": "Error connecting to database"});
        }
    });
});

app.listen(4941, function () {
    console.log('Example app listening on container port 4941!')
})




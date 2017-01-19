/*
GOOD START POINT:
https://code.tutsplus.com/tutorials/authenticating-nodejs-applications-with-passport--cms-21619
and
http://stackoverflow.com/questions/38136792/typeerror-req-flash-is-not-a-function
and
http://mherman.org/blog/2016/09/25/node-passport-and-postgres/#.WH7CxT_L9z0

to get mLab MongoDB URI. in CLI type: heroku config | grep MONGODB_URI
*/

var pg = require('pg');
const spawn = require('child_process').spawn;

//access yumbarrio db on heroko
//https://devcenter.heroku.com/articles/connecting-to-heroku-postgres-databases-from-outside-of-heroku
//http://stackoverflow.com/questions/25000183/node-js-postgresql-error-no-pg-hba-conf-entry-for-host

//REQUEST STRING:
/*
heroku pg:credentials YUMBARRIO_DB_URL
*/

var client = new pg.Client({
    user: "",
    password: "",
    database: "YUMBARRIO_DB_URL",
    port: 5432,
    host: "localhost",
    ssl: true
});

client.connect();



//queries are queued and executed one after another once the connection becomes available
var x = 1000;

while (x > 0) {
    client.query("INSERT INTO junk(name, a_number) values('Ted',12)");
    client.query("INSERT INTO junk(name, a_number) values($1, $2)", ['John', x]);
    x = x - 1;
}

var query = client.query("SELECT * FROM junk");
//fired after last row is emitted

query.on('row', function(row) {
    console.log(row);
});

query.on('end', function() {
    client.end();
});



//queries can be executed either via text/parameter values passed as individual arguments
//or by passing an options object containing text, (optional) parameter values, and (optional) query name
client.query({
    name: 'insert beatle',
    text: "INSERT INTO beatles(name, height, birthday) values($1, $2, $3)",
    values: ['George', 70, new Date(1946, 02, 14)]
});

//subsequent queries with the same name will be executed without re-parsing the query plan by postgres
client.query({
    name: 'insert beatle',
    values: ['Paul', 63, new Date(1945, 04, 03)]
});
var query = client.query("SELECT * FROM beatles WHERE name = $1", ['john']);

//can stream row results back 1 at a time
query.on('row', function(row) {
    console.log(row);
    console.log("Beatle name: %s", row.name); //Beatle name: John
    console.log("Beatle birth year: %d", row.birthday.getYear()); //dates are returned as javascript dates
    console.log("Beatle height: %d' %d\"", Math.floor(row.height / 12), row.height % 12); //integers are returned as javascript ints
});

//fired after last row is emitted
query.on('end', function() {
    client.end();
});


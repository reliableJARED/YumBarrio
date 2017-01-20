const pg = require('pg');

//CLI: heroku config
const connectionString = 'USE HEROKU CLI AN PUT HERE';

const client = new pg.Client(connectionString);
client.connect();
const query = client.query(
  'CREATE TABLE items(id SERIAL PRIMARY KEY, text VARCHAR(40) not null, complete BOOLEAN)');
query.on('end', () => { client.end(); });

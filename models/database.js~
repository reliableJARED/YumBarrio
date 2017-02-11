const pg = require('pg');

//CLI: heroku config
const connectionString = 'postgres://wxsdoihhpldehv:56dde6bd46f799dab9e84eb2700acd27f8bc247c0e4a1b4f1ab8abfdc8c3e468@ec2-54-235-204-221.compute-1.amazonaws.com:5432/d6a53ngdhflopa';

const client = new pg.Client(connectionString);
client.connect();
const query = client.query(
  'CREATE TABLE items(id SERIAL PRIMARY KEY, text VARCHAR(40) not null, complete BOOLEAN)');
query.on('end', () => { client.end(); });

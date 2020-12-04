const path = require('path');
const envPath = path.resolve(__dirname, './.env');
require('dotenv').config({ path: envPath });
const { connectDB, disconnectDB } = require('./models/db');
const User = require('./models/user');
connectDB();

const http = require('http');
const { handleRequest } = require('./routes');

const PORT = process.env.PORT || 3000;
const server = http.createServer(handleRequest);

server.on('error', err => {
  console.error(err);
  server.close();
});

server.on('close', () => console.log('Server closed.'));

server.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});

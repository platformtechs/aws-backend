/* eslint-disable no-console */
import http from 'http';
import dotenv from 'dotenv';

dotenv.config({ debug: process.env.DEBUG });

import app from './app';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, err => {
  if (err) {
    console.log(err);
  } else {
    console.log(`server is running on the port: ${PORT}`);
  }
});

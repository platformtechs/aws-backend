import express from 'express';
import { createConnect } from './config/db';
import middlewareConfig from './config/middleware';
import { UserRoutes, AwsRoutes } from './modules';

const app = express();

/*= ===Database config===*/
createConnect();

/*= ===Middleware config===*/
middlewareConfig(app);

app.use('/api', [UserRoutes, AwsRoutes]);

module.exports = app;

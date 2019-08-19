import express from 'express';
import { createConnect } from './config/db';
import middlewareConfig from './config/middleware';
import { StudentRoutes, TeacherRoutes, RequirementRoutes } from './modules';

const app = express();

/*= ===Database config===*/
createConnect();

/*= ===Middleware config===*/
middlewareConfig(app);

app.use('/api', [StudentRoutes, TeacherRoutes, RequirementRoutes]);

module.exports = app;

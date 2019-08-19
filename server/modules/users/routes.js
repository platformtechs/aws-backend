import { Router } from 'express';
import * as UserController from './controller';
import checkAuth from '../../config/checkAuth';
import { upload } from '../../config/fileUpload';

const routes = new Router();

routes.post('/user/create', checkAuth, UserController.createUser);
routes.post('/user/update/:id', upload.single(), checkAuth, UserController.updateUser);
routes.post('/user/delete', checkAuth, UserController.deleteUser);
routes.get('/user/all', checkAuth, UserController.getAllUser);
routes.get('/user/:id', checkAuth, UserController.getUser);
export default routes;

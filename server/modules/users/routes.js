import { Router } from 'express';
import * as UserController from './controller';
// import checkAuth from '../../config/checkAuth';
import { upload } from '../../config/fileUpload';

const routes = new Router();

routes.post('/user/create', UserController.createUser);
routes.post('/user/update/:id', upload.single(), UserController.updateUser);
routes.post('/user/delete', UserController.deleteUser);
routes.get('/user/all', UserController.getAllUser);
routes.get('/user/:id', UserController.getUser);
export default routes;

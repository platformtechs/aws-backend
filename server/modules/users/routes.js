import { Router } from 'express';
import * as UserController from './controller';
// import checkAuth from '../../config/checkAuth';
import { upload } from '../../config/fileUpload';

const routes = new Router();

routes.post('/user/create/user', UserController.createUser);
routes.post('/user/create/admin', UserController.createAdmin);
routes.post('/user/create/subadmin', UserController.createSubAdmin);
routes.post('/user/create/accesskey', UserController.createAccesskey);
routes.post('/user/login', UserController.login);
routes.post('/user/update/:id', upload.single(), UserController.updateUser);
routes.post('/user/delete', UserController.deleteUser);
routes.get('/user/all', UserController.getAllUser);
routes.post('/user', UserController.getUser);
export default routes;

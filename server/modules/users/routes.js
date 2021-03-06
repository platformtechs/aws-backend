import { Router } from 'express';
import * as UserController from './controller';
// import checkAuth from '../../config/checkAuth';
import { upload } from '../../config/fileUpload';

const routes = new Router();

// routes.post('/user/create/user', UserController.createUser);
routes.post('/user/create/admin', UserController.createAdmin);
routes.post('/user/create/subadmin', UserController.createSubAdmin);
routes.post('/user/create/accesskey', UserController.createAccesskey);
routes.post('/user/login', UserController.login);
routes.post('/user/update/:id', UserController.updateUser);
routes.post('/user/delete', UserController.deleteUser);
routes.post('/user/all', UserController.listUser);
routes.post('/user/get', UserController.getUser);
routes.post('/user/changepass', UserController.changePass);
routes.post('/user/renew', UserController.renewUser);
export default routes;

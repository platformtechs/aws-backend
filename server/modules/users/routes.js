import { Router } from 'express';
import * as UserController from './controller';
import checkAuth from '../../config/checkAuth';
import { upload } from '../../config/fileUpload';

const routes = new Router();

// routes.post('/user/create/user', UserController.createUser);
routes.post('/user/create/admin', UserController.createAdmin);
routes.post('/user/create/subadmin',checkAuth, UserController.createSubAdmin);
routes.post('/user/create/accesskey', checkAuth, UserController.createAccesskey);
routes.post('/user/login', UserController.login);
routes.post('/user/update/:id', checkAuth, upload.single(), UserController.updateUser);
routes.post('/user/delete', checkAuth, UserController.deleteUser);
routes.post('/user/all', checkAuth, UserController.listUser);
routes.post('/user/get', checkAuth,UserController.getUser);
routes.post('/user/changepass', checkAuth, UserController.changePass);
routes.post('/user/renew', UserController.renewUser)
export default routes;

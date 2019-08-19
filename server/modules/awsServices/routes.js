import { Router } from 'express';
import * as AwsController from './controller';
// import checkAuth from '../../config/checkAuth';
import { upload } from '../../config/fileUpload';

const routes = new Router();

routes.post('/aws/create', AwsController.createUser);
routes.post('/aws/update/:id', upload.single(), AwsController.updateUser);
routes.post('/aws/delete', AwsController.deleteUser);
routes.get('/aws/all', AwsController.getAllUser);
routes.get('/aws/:id', AwsController.getUser);
export default routes;

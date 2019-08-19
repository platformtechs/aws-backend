import { Router } from 'express';
import * as AwsController from './controller';
// import checkAuth from '../../config/checkAuth';
// import { upload } from '../../config/fileUpload';

const routes = new Router();

routes.post('/aws/create', AwsController.createInstance);
routes.post('/aws/start', AwsController.startandstopInstance);
routes.post('/aws/stop', AwsController.startandstopInstance);
routes.get('/aws/reboot', AwsController.rebootInstance);
export default routes;

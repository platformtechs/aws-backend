import { Router } from 'express';
import * as AwsController from './controller';
// import checkAuth from '../../config/checkAuth';
// import { upload } from '../../config/fileUpload';

const routes = new Router();

routes.post('/aws/create', AwsController.createInstance);
routes.post('/aws/getpass', AwsController.getPassword);
routes.post('/aws/list', AwsController.listInstances);
routes.post('/aws/start', AwsController.startInstance);
routes.post('/aws/stop', AwsController.stopInstance);
routes.post('/aws/reboot', AwsController.rebootInstance);
routes.post('/aws/delete', AwsController.terminateInstance);
export default routes;

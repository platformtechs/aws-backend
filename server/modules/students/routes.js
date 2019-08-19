import { Router } from 'express';
import * as StudentController from './controller';
// import checkAuth from '../../config/checkAuth';
import { upload } from '../../config/fileUpload';

const routes = new Router();

routes.post('/student/create', StudentController.createStudent);
routes.post('/student/update/:id', upload.single(), StudentController.updateStudent);
routes.post('/student/delete', StudentController.deleteStudent);
routes.post('/student/nearby', StudentController.getNearbyStudent);
routes.get('/student/all', StudentController.getAllStudent);
routes.get('/student/:id', StudentController.getStudent);
routes.post('/student/requirement/:id', StudentController.addRequirement);
routes.get('/student/requirement/:id', StudentController.getRequirement);
export default routes;

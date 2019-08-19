import { Router } from 'express';
import * as TeacherController from './controller';
import checkAuth from '../../config/checkAuth';
import { upload } from '../../config/fileUpload';

const routes = new Router();

routes.post('/teacher/create', TeacherController.createTeacher);
routes.post("/teacher/update/:id",  upload.single(), TeacherController.updateTeacher);
routes.post("/teacher/delete",  TeacherController.deleteTeacher);
routes.post("/teacher/nearby/",  TeacherController.getNearbyTeacher)
routes.get("/teacher/all",  TeacherController.getAllTeacher);
routes.get("/teacher/:id",  TeacherController.getTeacher)

export default routes;
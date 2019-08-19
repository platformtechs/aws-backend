import { Router } from 'express';
import * as RequirementController from './controller';
import checkAuth from '../../config/checkAuth';

const routes = new Router();

routes.get("/requirements",  RequirementController.getAllRequirements);
routes.post("/requirements",  RequirementController.getNearbyRequirements);

export default routes;
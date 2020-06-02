import express, { request } from 'express';
import ItemsController from '../src/controllers/ItemsController';
import PointsController from '../src/controllers/PointsController';

const pointsController = new PointsController();
const itemsController = new ItemsController();

const routes = express.Router();

routes.route('/items')
  .get(itemsController.index)

routes.route('/points')
  .get(pointsController.index)
  .post(pointsController.create);

routes.route('/points/:id')
  .get(pointsController.show);


export default routes;
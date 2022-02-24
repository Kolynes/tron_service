import messages from '../utils/messages';
import response from '../utils/response';
import { tronRoute } from './api/tron';

const routes = (router) => {
  router
    .route('/')
    .get((req, res) => response(res, 200, 'success', {
      message: messages.apiV1Welcome,
    }));

  // user routes
  tronRoute(router);
};

export default routes;

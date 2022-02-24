import express from 'express';
import trimmer from 'trim-request-body';
import cors from 'cors';
import debug from 'debug';
import morganBody from 'morgan-body';
import methodOverride from 'method-override';
import response from './utils/response';
import messages from './utils/messages';
import './config/env';
import db from './models';

import routes from './routes';
import tronWatcher from './watchers/tron';
import { BinaryTree, getTree} from './tree';

declare global {
  var addressTree: BinaryTree
}

getTree();

const app = express();
const infoLog = debug('http:info');
const router = express.Router();

tronWatcher();

routes(router);
morganBody(app, { prettify: true });
// Allow cross origin access
app.use(cors());
// Parse application/json
app.use(express.json());

// Parse application/xwww-
app.use(express.urlencoded({ extended: false }));

// Trim the parsed request body
app.use(trimmer);

app.use(methodOverride());

// Handle base route
app.get('/', (req, res) => response(res, 200, 'success', {
  message: messages.welcome,
}));
app.use('/api/v1', router);

app.use('*', (req, res) => response(res, 404, 'error', {
  message: messages.notFound,
}));

db.sequelize
  .authenticate()
  .then(() => {
    infoLog('connection to database successful');
    const server = app.listen(
      process.env.PORT || 3000,
      () => infoLog(`Listening on port ${server.address()}`)
    );
  })
  .catch((e: Error) => {
    infoLog('Failed to connect to the database');
    throw e.message;
  });

// app.listen(8080, "localhost", () => console.log("running on port 8080"));
export default app;

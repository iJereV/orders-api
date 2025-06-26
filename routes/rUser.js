import Router from 'express';
import cUser from '../controllers/cUser.js';
import { authRequired } from '../middlewares/validateToken.js';

const rUser = Router();

rUser.post('/register', cUser.register);
rUser.post('/login', cUser.login);
rUser.get('/check',authRequired,cUser.checkLogin)

export default rUser;
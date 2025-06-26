import express from 'express';
import rUser from './routes/rUser.js';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import path from 'path';
import multer from 'multer';
import session from 'express-session';
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import {conectDB} from './config/db.js'
import {authRequired} from './middlewares/validateToken.js'
import { TOKEN_SECRET } from './config/config.js';
import rProduct from './routes/rProduct.js';
import rOrder from './routes/rOrder.js';
import rDocuments from './routes/rDocuments.js';
import dotenv from 'dotenv';
dotenv.config();

conectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer();
const port = 3000;

app.use(cors({ origin: 'https://bucolic-paprenjak-edf523.netlify.app', credentials: true}));
app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.set("views", path.join(__dirname,"views"));
app.set("view engine","pug");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "script-src 'self' 'unsafe-inline'");
    next();
});

app.use(session({
    secret:TOKEN_SECRET,
    resave:false,
    saveUninitialized: true,
    cookie: {
    httpOnly: true,
    secure: false, // ⚠️ en HTTP, esto debe ser false
    sameSite: 'None'
  }
}));

app.use(upload.none());

app.use(rUser);
app.use(rProduct);
app.use(rOrder);
app.use(rDocuments)

app.listen(port,()=>{console.log('Servidor corriendo en http://localhost:3000')});
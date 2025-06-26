import jwt from 'jsonwebtoken'
import { TOKEN_SECRET } from '../config/config.js';

export const authRequired = (req,res,next) =>{
    const token = req.cookies.token;
    console.log(token)
    if(!token) return res.status(401).json({message:'No logueado.'});

    jwt.verify(token,TOKEN_SECRET, (err, user)=>{
        if(err) return res.status(403).json({message:'No autorizado.'});;
        req.user = user;
        next();
    });
}
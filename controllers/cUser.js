import mUser from '../models/mUser.js';
import {registerSchema,loginSchema} from '../schemas/sUser.js';
import bcrypt from 'bcrypt';
import { createAccessToken } from '../config/jwt.js';

const cUser = {
    register: async(req,res)=>{
        try {
            const {username,email,password,confirmPassword} = req.body;
            
            if(password!=confirmPassword){
                throw{
                    status: 403,
                    text: 'Las contraseñas deben coincidir.'
                }
            }

            const userFound = await mUser.getOne(email);

            if(userFound){
                throw{
                    status: 409,
                    text: 'El correo electrónico ya está registrado.'
                }
            }

            const validation = registerSchema.safeParse({ username, email, password });
            if (!validation.success) {
                throw{
                    status: 403,
                    text: validation.error.errors[0].message
                }
            }

            mUser.create(username,email,password);

            res.sendStatus(200);
        } catch (error) {
            res.status(error.status || 500).json({ text : error.text || "Internal server error." });         
        }
    },
    login: async(req,res)=>{
        try {
            const {email,password} = req.body;

            const validation = loginSchema.safeParse({email,password});
            if (!validation.success) {
                throw{
                    status: 403,
                    text: validation.error.errors[0].message
                }
            }

            const userFound = await mUser.getOne(email);

            if(!userFound){
                throw{
                    status: 401,
                    text: 'Email no registrado.'
                }
            }

            const isMatch = await bcrypt.compare(password,userFound.password);

            if(!isMatch){
                throw {
                    status:403,
                    text: `Contraseña incorrecta.` 
                } 
            }

            const token = await createAccessToken({
                id:userFound._id,
                username:userFound.username,
                email:userFound.email,
                role: userFound.role
            });

            res.cookie('token', token, { httpOnly: true, sameSite: 'Lax' });

            res.status(200).json({text: 'Inicio de sesión exitoso.'});
            
        } catch (error) {
            console.log(error)
            res.status(error.status || 500).json({ text : error.text || "Internal server error." });   
        }
    },
    checkLogin: async(req,res) =>{
        res.status(200).json({text: 'El usuario esta logueado.'});
    }
}

export default cUser;
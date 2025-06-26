import moongose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new moongose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique:true
    },
    password:{
        type: String,
        required: true
    }
});

const User = moongose.model('User',userSchema);

const mUSer = {
    create: async(username,email,password) => {
        try {
            const hashPass = await bcrypt.hash(password,12);
            const newUser = new User({username,email,password:hashPass});
            await newUser.save();
        } catch (error) {
            throw {status: 500, text: "Error al crear usuario."};
        }
    },
    getOne: async(email) => {
        try {
            const user = await User.findOne({email});
            return user;
        } catch (error) {
            throw {status: 500, text: "Error al obtener un usuario."};
        }
    }
}

export default mUSer;
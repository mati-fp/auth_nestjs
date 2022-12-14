import * as mongoose from "mongoose";
import * as bcrypt from "bcrypt";

// Mongoose used to define this before mongoose 6. For backward's compatibility, we will now just define it ourselves.
//Colocar essa interface em node-modules->mongoose->types->index.d.ts dentro do module 'mongoose'.
/*
export interface HookNextFunction{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error?: Error): any
}
*/

export const UsersSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    }
})

//Criptografando a senha por aqui, sem ser no serviço
//Next serve de middleware
UsersSchema.pre('save', async function (next: mongoose.HookNextFunction) {
    try {
        if (!this.isModified('password')){
            return next();
        }
        
        this['password'] = await bcrypt.hash(this['password'], 10);
    } catch(error){
        return next(error);
    }
})
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const User = require('./model/user');
const bcrypt= require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET= 'SAASKDSKDSFJDKFDKFLSDKFE12334';

const uri = 'mongodb+srv://Admin:admin123@cluster0.ypyvi.mongodb.net/CentralClinic?retryWrites=true&w=majority'
const options = {useNewUrlParser: true, useUnifiedTopology: true};
// Or using promises
mongoose.connect(uri, options).then(
 () => { console.log('Conectado a DB') },
 err => { console.log(err) }
);
//Random comment
app.use('/', express.static(path.join(__dirname, 'static')));
app.use(express.json());

app.post('/api/login', async(req, res)=>{

    const{username, password}= req.body
    const user = await User.findOne({username}).lean()

    if(!user){
        return res.json({status: 'error', error:'Usuario o contraseña inválidos'})
    }
    if(await bcrypt.compare(password, user.password)){
        const token = jwt.sign({
            id: user._id, 
            username: user.username,
        }, JWT_SECRET)
        return res.json({status: 'ok', data: token})
    }
    res.json({status:'error', error:'Usuario o contraseña inválidos'})
})

//Client: server : Your clienter as to authenticate who it is

app.post('/api/register', async (req,res)=>{
    console.log(req.body); 
    // Analysts
    //Scripts reading databases
    //Open API accses to your databases
    //Hasing the passwords
    const{username, password: plainTextPassword, email, phone}= req.body

    const password = await bcrypt.hash(plainTextPassword, 10)
    //console.log(await bcrypt.hash(password, 10))

    try{
        const response = await User.create({
            username,
            password,
            email,
            phone
        })
        console.log('User creado Satisfactoriamente: ', response)
    }catch(error){
        if (error.code === 11000){
            return res.json({status: 'error', error: 'El usuario ya está en uso'})
        }
        throw error
    }

    res.json({status: 'ok'});
});

app.set('puerto', process.env.PORT || 3000);
app.listen(app.get('puerto'), function () {
 console.log('Example app listening on port '+ app.get('puerto'));
});

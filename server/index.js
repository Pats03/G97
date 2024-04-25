const express = require("express");
const bcrypt= require("bcrypt");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const app = express();
const port=3000;
const secretKey="hi";

const {recipe,user} = require("./schema/schema");
const routes = require("./routes/routes");

app.use(express.json())

let connect = async () => { 
    try{ 
        await mongoose.connect("mongodb+srv://amethyst88:Nigger123@cluster0.43osksu.mongodb.net/KitchenWizard");
        console.log("db ready");
        return true
    }
    catch(err) {
        console.log(' error connecting');
        return false
    }
}
if(connect()){
    var db=mongoose.connection;
}
app.get("/",(req,res)=>{
    res.send(JSON.stringify({
        "error":"false",
        "msg":"server awake"
    }));
})

app.post("/signup",async (req,res)=>{
    let usn = req.body.user;
    let mail = req.body.mail;
    let pass = req.body.pass;
    
    var check = await user.findOne({mail});
    if(check){
        console.log("user already exist");
        res.send(JSON.stringify({
            "error":true,
            "msg":"user exists"
        }));
    }else{
        let hp=await bcrypt.hash(pass, 10)
        await new user({mail:mail,username:usn,password:hp,fav:[]}).save()
        res.send(JSON.stringify({"error":false,"msg":"acc created"}));
    }
    
})

app.post('/login',async(req,res)=>{
    let mail = req.body.mail;
    let pass = req.body.pass;
    var check = await user.findOne({mail});
    
    if(check){
        if(await bcrypt.compare(pass,check.password)){
            const token = jwt.sign({ mail: mail ,roll:"user",id:check._id}, secretKey);
            res.send(JSON.stringify({
                "error":false,
                "token": token
            }));
        }
    }else{
        res.status(404).send(JSON.stringify({
            "error":true,
            "msg":"user not found"
        }));
    }
})

app.use('/v2',auth,routes);

async function auth (req, res, next){
    var token = req.header('Authorization');
    if (!token) return res.status(401).json({erroe:true, msg: 'unauthorized' });
  
    try {
      const decodedToken = jwt.verify(token, secretKey);
      const mail = decodedToken.mail;

      const us = await user.findOne({mail});
      if (!us) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      req.user = {
        id: user._id,
        mail: user.mail,
        username: user.username
      };

      next();
    } catch (error) {
    //   console.log('Token Verification Error:', error);
      return res.status(403).json({ message: 'Forbidden' });
    }
  };

app.get("*",(req,res)=>{
    res.status(404).send({
        "error":true,
        "msg":"the page you are looking for is not looking for you"
    });
})
app.post("*",(req,res)=>{
    res.status(404).send({
        "error":true,
        "msg":"the page you are looking for is not looking for you"
    });
})

app.listen(port,()=>{
    console.log(`server ready at ${port}`);
})


  
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt=require('bcrypt')
const connectToDB = require('./mongoDB')
const jwt= require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config()

app.use(cors());
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
  }));

const Routes = express.Router();
app.use('/api', Routes);

let Post=require("./models/post.model")
let User=require("./models/user.model")

app.listen(process.env.PORT, function() {
    console.log("Server is running on Port: " + process.env.PORT);
});

connectToDB()
 

Routes.route('/login').post(async function(req,res){
   
        User.findOne({email: req.body.email}, async function(err,user){
        if(err) throw err;
        if(user)
         {
            
            if(await bcrypt.compare(req.body.password,user.password))
            {
               
                const token =jwt.sign(user.toJSON(),process.env.SECRET_KEY)
                res.json(token)

            }else
                res.json(401)
         }   
        else
            res.json(403);
        
    });
        
    
})


Routes.route('/register').post(async function(req,res){
    
    const salt= await bcrypt.genSalt();
    const hashed=await bcrypt.hash(req.body.password.toString(),salt);
    let user=new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashed
    })
    user.save((err)=>
    {
        if(err) throw err;
        else
            {
                res.json(user)
                console.log("User Added Successfully")
    }
    })
    
    

})

Routes.route('/newpost').post(authenticateToken,async function(req,res){
   
    let post=new Post({
        subject: req.body.subject,
        body: req.body.body,
        author: req.user.firstName+" "+req.user.lastName,
        user_id: req.user._id
    })
    await post.save(function(err) {
        if (err)
           throw err;
        else 
           console.log('Post Added Successfully...');
    });
    
    res.json(await Post.find())
})

Routes.route('/delete/:id').delete(function(req,res){
    
    console.log(req.params.id)
    Post.deleteOne({ _id: req.params.id }, function(err, result) {
        if (err) {
          res.send(err);
        } else {
          res.json(result);
        }
      });
});


Routes.route('/update/:id').post(function(req,res){
   
    
    Post.updateOne(
        {_id: req.params.id},
        { $set: { subject: req.body.subject,body: req.body.body}

        }).then((obj) => {
            console.log('Updated - ' + obj);
            
        })
        .catch((err) => {
            console.log('Error: ' + err);
        })
})

Routes.route('/home').get( authenticateToken,function(req, res) {
    
    Post.find()
    .then(data => 
    {
        res.json(data)
        
    }).catch((err)=>{
        
        console.log(err)
    })
        
    });

Routes.route('/home/:id').get(async function(req,res){
    
    await Post.find({_id: req.params.id},(err,data)=>
    {
        if(err) throw err;
        if(data)
        {
            res.json(data)
        }
    })
})

Routes.route('/getUser').get(authenticateToken,async function(req,res){
    if(req.user)
        res.json(req.user)
    else
        res.sendStatus(403)
})


function authenticateToken(req,res,next){
    const authHeader=req.headers['authorization'];
    const token=authHeader && authHeader.split(' ')[1]
    
    if(token==null)
    {
        res.send("No Token Found");
    }
    else
    {
        jwt.verify(token,process.env.SECRET_KEY,(err,user)=>
    {
        if(err) return res.sendStatus(403);
        req.user=user;
        next();
    })
}
}
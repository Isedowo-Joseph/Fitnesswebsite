const express = require ('express');
const expressLayouts = require ('express-ejs-layouts')
const mongoose = require ('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const app =  express();
const path = require('path');
const mongodb = require('mongodb');
const multer = require('multer');
const fs = require ('fs');
const bodyParser = require('body-parser');

app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'images')));




// Passport config
require('./config/passport')(passport);

// DB Config

const db = require('./config/keys').MongoURI;

// Connect to Mongo

mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology:true})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

const MongoClient = mongodb.MongoClient;
const url = 'mongodb+srv://Joseph:Gbemileke12!@cluster0.9au92.mongodb.net/test'

var database;
MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology:true},(err,client) => {
    if (err) return console.log(err);
    database = client.db('<dbname>');
    app.listen(3000,() => {
      console.log("mongodb server is listening at 3000")
    })
    database.collection("users").find({}).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      
      })
  })




// EJS

app.use(expressLayouts);
app.set('view engine', 'ejs'); 

//Bodyparser

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Express Session

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))

// Passport middleware 
app.use(passport.initialize());
app.use(passport.session());

// Connect flash

app.use(flash());

// Global Vars

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');       // because since  we implemented connect  flash we have this flash object
    res.locals.error_msg = req.flash('error_msg');       // we have global variables in them and we should be able to call success_msg and error_msg
    res.locals.error = req.flash('error'); 
    next();
});
// storage cb stands falls callback

var storage = multer.diskStorage({
    destination:function(req,file,cb){
      cb(null,'uploads')
    },
    filename:function(req,file,cb){
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
  })
  
  var upload = multer({
    storage:storage
  });

  app.post("/upload", upload.single('myimage'),(req,res) => {
  
    if (!req.file) {
        res.redirect('dashboard')  
    }
    else {
    var img = fs.readFileSync(req.file.path);
	  var encode_image=img.toString('base64');

    //define a JSON object for the image

    var finalImg = {
      contentType:req.file.mimetype,
      path:req.file.path,
      image:new Buffer(encode_image,'base64') // buffer object is to convert the img to raw binary data
    };

    // insert the image to the database
 database.collection('users').update(
          
          {"name": req.body.name},
          {$set: {"img": finalImg}}
    ) 
    
    console.log('image uploaded');	
    
    console.log("Saved to database");
   
  

  var name = req.body.name;
  function dab() {database.collection("users").find({name}).toArray(function(err, result) {
    console.log(result)
    if (err) {
    console.log(err);
    }
    else if(result) {
    console.log('this user has a image to display');
    res.render('dashboard', {name:req.body.name,file:result, img:"displayed"});
    
  }
    else if (!result.img) {
    console.log('this user does not have a image to display')
    res.render('dashboard', {name:req.body.name, img:"nothing"});
    }
    
    })
}
setTimeout(dab,1000);

    }

  
})


// Routes
app.use('/', require ('./routes/index'));
app.use('/users', require ('./routes/users'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server Started on port ${PORT}`));
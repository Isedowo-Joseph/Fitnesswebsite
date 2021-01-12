const express = require('express');
const router = express.Router();
const { ensureAuthenticated} = require('../config/off');
const User = require('../models/User');
const path = require('path');
const ObjectID = require('mongodb').ObjectID
const mongodb = require('mongodb');


router.use(express.static(path.join(__dirname, '/views/login.ejs')));

//Welcome Page
router.get ('/', (req, res) => res.render('home'));
router.get ('/home', (req, res) => res.render('home'));


//Dashboard
router.get ('/dashboard', ensureAuthenticated, (req, res) =>   // if you want dashboard to be protected just bring in this const { ensureAuthenticated} = require('../config/off')


User.find({'img' : req.user.img}, (err, items) => { 
   
    if (err) { 
        console.log(err); 
    } 
    else if (!req.user.img) {
        res.render('dashboard', {name: req.user.name, img:"nothing"}); 
    } 
    else if (req.user.img) {
        res.render('dashboard',  {name: req.user.name,file: items, img: "displayed"}); //! this means a variable is empty
    }

}));
// 

const MongoClient = mongodb.MongoClient;
const url = 'mongodb+srv://Joseph:Gbemileke12!@cluster0.9au92.mongodb.net/test'

var database;
MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology:true},(err,client) => {
    if (err) return console.log(err);
    database = client.db('<dbname>');
    database.collection("users").find({}).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      
      })
  })
router.get('/appointments',(req,res,next) => {
    
    database.collection("users").find({})
    .toArray()
    .then(results => res.json(results))
    .catch(error => res.send(error))
});

router.post('/appointments',(req,res,next) => {
    const {appointmentDate, name, email } = req.body;
    if (!appointmentDate || !name || !email) {
        return res.status(400).json ({
            message: 'Appointment date, name and email are required'
        });
    }
    const payload = {appointmentDate, name, email};
    database.collection("users").insertOne(payload)
        .then(result => res.json(result.ops[0]))
        .catch(error => res.send(error));
});

router.delete('/appointments/:id', (req,res,next) => {
    const { id } = req.params;
    const _id = ObjectID(id);

    database.collection("users").deleteOne({_id})
    .then(result => res.json(result))
    .catch(error => res.json(error));

});
 


module.exports = router;
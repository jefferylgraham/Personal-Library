/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
var db;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, database) {
    if(err) {
      console.log(err);
    }
    console.log('Connected...');
    db = database;
  });

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      db.collection('personal-library').find().toArray((err, results) => {
        if (err) {
          console.log(err);
        }
        else {
          results.forEach(element => {
            element.commentcount = element.comments.length;
            delete element.comments;
          });
          res.json(results);
        }
      });
    })
    
    .post(function (req, res){
      var title = req.body.title;
      req.body.comments = [];
      //response will contain new book object including atleast _id and title
      if (title == '') {
        res.send('missing title');
      }
      
      db.collection('personal-library').save(req.body, (err, result) => {
        if (err) {
          console.log(err);
        }
        else {
          return res.json({
            title: title,
            _id: req.body._id,
            comments: req.body.comments
          });
        }
      });  
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      var objId = new ObjectId(bookid); 
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      db.collection('personal-library').find({_id: objId}).toArray((err, result) => {
        if (err) {
          console.log(err);
        }
        if (result.length > 0) {
          res.json(result);
        }            
        else {
          res.send('no book exists');
        }
      });
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var objId = new ObjectId(bookid);
      var comment = req.body.comment;
      //json res format same as .get
      db.collection('personal-library').findAndModify(
          {_id: objId}, 
          [['_id','asc']],
          {$push: {comments: comment }}, 
          {new: true},
          (err, book)=> {
            if (err) {
              console.log(err)
            }
            else {
              res.json(book.value);
            }
          });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
  
};

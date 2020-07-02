//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const e = require("express");

const date = require(__dirname + "/date.js");

const app = express();

const _ = require('lodash');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin:ik0VvWxKLw0fhEOG@cluster0.8stog.mongodb.net/listDB',  { useUnifiedTopology: true });

const itemsSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model("Item",itemsSchema);

const items = [{name:"Buy this"},{name:"Go there"},{name:"Settle that"}];

const listSchema = new mongoose.Schema({
  name:String,
  listItems:[itemsSchema]
});

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res){
  Item.find(function(err,docs){
    if(err){
      console.log("Error logging documents");
    }
    else{
      if(docs.length===0){
        Item.insertMany(items,function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("Items added successfully");
          }
        });
        res.redirect("/");
      }
      else{
        const day = date.getDate();
        res.render("list", {custList:'',listTitle: day, newListItems: docs});
      }
    }
  });
});

app.post("/", function(req, res){

  const item = new Item({
    name:req.body['newItem']
  });
  item.save();
  res.redirect("/");
});

app.post("/delete",function(req,res){
  const idToDelete = req.body['checkbox'];
  Item.findByIdAndDelete(idToDelete,function(err){
    if(err){
      console.log("Can't delete ID");
    }
    else{
      console.log("Deleted item");
      res.redirect("/");
    }
  });
});

app.get("/:clist", function(req,res){
  const customListName = _.startCase(_.toLower(req.params['clist']));
  List.findOne({name:_.toLower(req.params['clist'])},function(err,docs){
    if(err){
      console.log("Can't show custom list");
    }
    else{
      if(docs===null){
        const list = new List({
          name:_.toLower(req.params['clist']),
          listItems:[]
        });
        list.save();
        res.render("list",{custList:req.params['clist'],listTitle: customListName, newListItems: list['listItems']});
      }
      else{
        res.render("list",{custList:req.params['clist'],listTitle: customListName, newListItems: docs['listItems']});
      }
    }
  });
});

app.post("/:clist", function(req, res){
  const customListName = _.startCase(req.params['clist']);
  const item = new Item({
    name:req.body['newItem']
  });
  List.updateOne({name:_.toLower(req.params['clist'])},{$push:{listItems:item}},function(err){
    if(err){
      console.log("Can't show custom list");
    }
    else{
      console.log("Updated successfully");
      res.redirect("/"+req.params['clist']);
    }
  });
});

app.post("/delete/:clist",function(req,res){
  const customListName = _.startCase(_.toLower(req.params['clist']));
  const idToDelete = req.body['checkbox'];
  List.updateOne({name:_.toLower(req.params['clist'])},{$pull:{'listItems':{_id:idToDelete}}},function(err){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/"+customListName);
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port,function(){
  console.log("Connected to port successfully!");
});

const express = require('express');

const ejs = require('ejs');

const mongoose = require('mongoose');

const _ = require("lodash");

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/toDoList", { useNewUrlParser: true });

const itemsSchema = new mongoose.Schema({
     name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({ name: "Robert" });

const item2 = new Item({ name: "Henry" });

const item3 = new Item({ name: "Steve" });

const defaultItems = [item1, item2, item3];

const listSchema = {
     name: String,
     items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {
     Item.find({}, function (err, foundItems) {
          if (foundItems.length == 0) {
               Item.insertMany(defaultItems, function (err) {
                    if (err) {
                         console.log(err);
                    }
                    else {
                         console.log("Successfully added to DB");
                    }
               });
               res.redirect("/");
          }
          else {
               res.render('list', { todayDay:"Today", field: foundItems });          
          }
          
     });
});


app.get("/:customListName", function (req, res) {
     const customListName = _.capitalize(req.params.customListName);
     List.findOne({ name: customListName }, function (err, foundList) {
          if (!err) {
               if (!foundList) {
                    const list = new List({
                         name: customListName,
                         items: defaultItems
                    });
                    list.save();
                    res.redirect("/" + customListName);
               }
               else {
                    res.render('list', { todayDay: foundList.name, field: foundList.items });
               }
          }
     });

});

app.post("/", function (req, res) {
     const itemName = req.body.userinput;
     const listName = req.body.list;
     const item = new Item({
          name: itemName
     });
     if (listName ==="Today") {
          item.save();
          res.redirect("/"); 
     }
     else {
          List.findOne({name: listName}, function (err, foundList) {
               let foundListArray = foundList.items;
               foundListArray.push(item);
               res.redirect("/" + listName);

          });
     }

     
});

app.post("/delete", function (req, res) {
     const checked = req.body.checkbox;
     console.log(checked);
     const listName = req.body.listName;
     if (listName === "Today") {
          Item.findByIdAndRemove(checked, function (err) {
               if (!err) {
                    console.log("Successfully deleted checked item");
                    res.redirect("/");
               }
               else {
                    console.log(err);
               }
          });
     } else {
          List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checked } } }, function (err, foundList) {
               if (!err) {
                    res.redirect("/" + listName);
               }
          });
     }
});

app.get("/about", function(req, res){
     res.render("about");
});


app.listen(3000, function () {
     console.log("Server running on port 3000");
});
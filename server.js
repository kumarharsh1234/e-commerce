const express=require("express");
const app=express();
app.use(express.json());
const path=require("path");
const fs=require("fs");
app.use(express.static("."));
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
const session=require("express-session");
const cookie=require("cookie-parser");
let dbinstance;
const client=require("mongodb").MongoClient;
const ObjectId=require("mongodb").ObjectId;
;client.connect("mongodb://localhost:27017",{}).then((database)=>{
    dbinstance = database.db("ProductData");
    console.log("Database connect.....");
}).catch((err)=>{
    console.log(err);
});
const loginRoute=require("./routes/login.js");
const signupRoute=require("./routes/signup.js");
const cart=require("./routes/cart.js");
const admin=require("./routes/admin.js");
app.use("/",loginRoute);
app.use("/",signupRoute);
app.use("/",cart);
app.use("/",admin)
//Home Page
app.get("/",(req,res)=>{
    dbinstance.collection("Data").find({}).toArray().then((data)=>{
        res.render("home",{data, flag: 0});
    })
    
});
app.get("/:id",(req,res)=>{
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(400).send('Invalid ObjectId');
    }

    dbinstance.collection("Data").findOne({"_id": new ObjectId(id)}).then((data)=>{
        res.render("product",{obj:data});
    }).catch(err => {
        console.error(err);
        res.status(500).send('Internal Server Error');
    });
});
app.listen(3000);
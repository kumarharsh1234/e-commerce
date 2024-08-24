const express=require("express");
const router=express.Router();
const app=express();
const path=require("path");
router.use(express.urlencoded({extended:true}));
const session=require("express-session");
app.set("view engine","ejs");
const cookie=require("cookie-parser");
let dbinstance;
const client=require("mongodb").MongoClient;
client.connect("mongodb://localhost:27017",{}).then((database)=>{
    dbinstance = database.db("ProductData");
}).catch((err)=>{
    console.log(err);
});
router.get("/signup",(req,res)=>{
    res.sendFile(path.join(__dirname,"../signup.html"));
});
router.post("/signup",(req,res)=>{
    dbinstance.collection("loginData").findOne({$and:[{"username":req.body.username},{"password":req.body.password}]}).then((data)=>{
        //console.log(data);
        if(data==null){
            let obj={
                username:req.body.username,
                password:req.body.password
            }
            //console.log(obj);
            dbinstance.collection("loginData").insertOne(obj).then((data)=>{
                res.render("signup",{d:"User created successfully! Please login."});
            });
        }
        else{
            res.render("signup",{d: "Username already exists!"});
        }
    })
})

module.exports=router;

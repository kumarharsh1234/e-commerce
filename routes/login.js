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
const objectid=require("mongodb").ObjectId;
client.connect("mongodb://localhost:27017",{}).then((database)=>{
    dbinstance = database.db("ProductData");
}).catch((err)=>{
    console.log(err);
});
router.use(session({
    secret:"123rtyrfgdg",
    saveUninitialized:true,
    resave:false,
    cookie:{maxAge:600000000},
}));
router.get("/login",(req,res)=>{
    
    res.sendFile(path.join(__dirname,"../login.html"));
})
router.get("/dashboard",auth,(req,res,next)=>{

        dbinstance.collection("Data").find({}).toArray().then((data)=>{
            res.render("dashboard",{data,flag:1,username: req.session.username,userid:req.session.userid});
        });
});
router.get("/logout",(req,res)=>{
    req.session.destroy();
    res.redirect("/");
})
router.post("/login",(req,res)=>{
    dbinstance.collection("loginData").findOne({$and:[{"username":req.body.username},{"password":req.body.password}]}).then((data)=>{
        if(data==null){
            res.render("login",{message:"Invalid User and Password"});
        }
        else{
        req.session.username=data.username;
        req.session.userid=data._id;
        res.redirect("/dashboard");
        }
    })
});
app.get("/:id",(req,res)=>{
    dbinstance.collection("Data").findOne({"_id":new objectid(req.params.id)}).then((data)=>{
        //console.log(data);
        res.render("product",{obj:data});
        //res.end();
    })
})
function auth(req,res,next){
    if(req.session.username){
        next();
    }
    else{
        res.redirect("/login");
    }
}

module.exports=router;
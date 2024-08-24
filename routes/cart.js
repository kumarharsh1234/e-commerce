const express=require("express");
const router=express.Router();
const app=express();
app.use(express.json());
const path=require("path");
const fs=require("fs");
const { title } = require("process");
const { Session } = require("inspector");
const { request } = require("http");
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
let dbinstance;
const client=require("mongodb").MongoClient;
const ObjectId=require("mongodb").ObjectId;
client.connect("mongodb://localhost:27017",{}).then((database)=>{
    dbinstance = database.db("ProductData");
}).catch((err)=>{
    console.log(err);
});
router.post("/cart", (req, res) => {
    const uid=new ObjectId(req.session.userid);
    const id=req.body.id;
    //console.log("Requested ID:", req.body.id);
    dbinstance.collection("Data").findOne({"_id":new ObjectId(id)}).then((data) => {
        if (!data) {
            console.log("No data found for ID:", req.body.id);
            res.status(404).send("Data not found");
            return;
        }
        else{
            dbinstance.collection("cartData").findOne({$and:[{"u_id":uid},{"P_id":id}]}).then((d)=>{
                if(d==null){
                    const obj={
                        u_id:uid,
                        P_id:req.body.id,
                        title:data.title,
                        image:data.images,
                        price:data.price,
                        quantity:1,
                    }
                    dbinstance.collection("cartData").insertOne(obj).then((dt)=>{})
                }
                else{
                    const myQuery={"u_id":d.u_id,"P_id":d.P_id};
                    dbinstance.collection("cartData").updateOne(myQuery,{$set:{"quantity":d.quantity+1}}).then((f)=>{});
                }
            })
            
        }
    }).catch((err) => {
        console.error("MongoDB Error:", err);
        res.status(500).send("Internal Server Error");
    });
});
router.get("/cpage",(req,res)=>{
    const uid=req.session.userid;
    dbinstance.collection("cartData").find({u_id:new ObjectId(uid)}).toArray().then((data)=>{
        //console.log(data);
        res.render("cart",{d:data});
    })
})
router.post("/remove",(req,res)=>{
    let d=req.body;
    let id=d.id;
    dbinstance.collection("cartData").deleteOne({_id:new ObjectId(id)}).then((data)=>{
    });
    res.redirect("/cpage");
})
router.post("/qtyminus",(req,res)=>{
    let uid=req.session.userid;
    let pid=req.body.id;
    console.log(uid);
    console.log(pid);
    dbinstance.collection("cartData").findOne({$and:[{"u_id":new ObjectId(uid)},{"_id":new ObjectId(pid)}]}).then((d)=>{
    const myQuery={"u_id":new ObjectId(uid),"_id":new ObjectId(pid)};
    //console.log(d);
    //res.end();
    dbinstance.collection("cartData").updateOne(myQuery,{$set:{"quantity":d.quantity-1}}).then((f)=>{
        res.redirect("/cpage");
    });
});
})
router.post("/qtyadd",(req,res)=>{
    let uid=req.session.userid;
    let pid=req.body.id;
    console.log(uid);
    console.log(pid);
    dbinstance.collection("cartData").findOne({$and:[{"u_id":new ObjectId(uid)},{"_id":new ObjectId(pid)}]}).then((d)=>{
    const myQuery={"u_id":new ObjectId(uid),"_id":new ObjectId(pid)};
    //console.log(d);
    //res.end();
    dbinstance.collection("cartData").updateOne(myQuery,{$set:{"quantity":d.quantity+1}}).then((f)=>{
        res.redirect("/cpage");
    });
});
})
module.exports=router;
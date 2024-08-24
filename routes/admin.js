const express=require("express");
const app=express();
const router=express.Router();
app.use(express.json());
const path=require("path");
const fs=require("fs");
app.use(express.static("."));
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
const session=require("express-session");
const cookie=require("cookie-parser");
const { log } = require("console");
let dbinstance;
const client=require("mongodb").MongoClient;
const ObjectId=require("mongodb").ObjectId;
;client.connect("mongodb://localhost:27017",{}).then((database)=>{
    dbinstance = database.db("ProductData");
    //console.log("Database connect.....");
}).catch((err)=>{
    console.log(err);
});
router.use(session({
    secret:"123rtyrfgdg",
    saveUninitialized:true,
    resave:false,
    cookie:{maxAge:600000000},
}));
router.get("/admin",(req,res)=>{
    if(req.session.username==null){
        res.render("adminLogin");
    }
    else{
        dbinstance.collection("Data").find({}).toArray().then((data)=>{
            let name=req.session.username;
            res.render("admin",{data,flag:0,name});
        })
    }
});
router.post("/adminLogin",(req,res)=>{
    dbinstance.collection("adminLoginData").findOne({$and:[{"adminUsername":req.body.username},{"adminPassword":req.body.password}]}).then((d)=>{
        if(d==null){
            res.redirect("/admin");
        }
        else{
            req.session.username=d.adminUsername;
            req.session.adminId=d._id;
            //console.log(req.session.adminId);
            res.redirect("/admin");
        }
    })
});
router.get("/adminSignup",(req,res)=>{
    res.render("adminSignup");
});
router.post("/adminS",(req,res)=>{
    dbinstance.collection("adminLoginData").findOne({$and:[{"username":req.body.username},{"password":req.body.password}]}).then((data)=>{
        if(data==null){
            let obj={
                adminUsername:req.body.username,
                adminPassword:req.body.password
            }
            console.log(obj);
            dbinstance.collection("adminLoginData").insertOne(obj).then((data)=>{
                res.redirect("/admin");
            })
        }
        else{
            res.redirect("/adminSignup");
        }
    })
})

router.get("/updateForm/:id",(req,res)=>{
    let id=req.params.id;
    dbinstance.collection("Data").findOne({"_id":new ObjectId(id)}).then((data)=>{
        res.render("updateForm",{d:data});
    })
})
router.post("/addProduct",(req,res)=>{
    const id=req.body.productid;
    //console.log(id);
    dbinstance.collection("Data").findOne({"_id":new ObjectId(id)}).then((data)=>{
        //console.log(data);
        const myQuery={"_id":data._id};
    dbinstance.collection("Data").updateOne(myQuery,{$set:{"title":req.body.productTitle,"description":req.body.productDescription,"price":req.body.productPrice,"images":req.body.productImage,"stock":req.body.productStock}}).then((f)=>{
        res.redirect("/admin");
    });
    })
});
router.get("/removeItem/:id",(req,res)=>{
    const id=req.params.id;
    dbinstance.collection("Data").deleteOne({_id:new ObjectId(id)}).then((data)=>{
        res.redirect("/admin");
    });
});
router.post("/acart", (req, res) => {
    const uid=new ObjectId(req.session.adminId);
    const id=req.body.id;
    //console.log(uid);
    console.log("Requested ID:", req.body.id);
    dbinstance.collection("Data").findOne({"_id":new ObjectId(id)}).then((data) => {
        if (!data) {
            console.log("No data found for ID:", req.body.id);
            res.status(404).send("Data not found");
            return;
        }
        else{
            dbinstance.collection("cartData").findOne({$and:[{"u_id":uid},{"P_id":id}]}).then((d)=>{
                //console.log(d);
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

router.get("/adminCart",(req,res)=>{
    const uid=req.session.adminId;
    //console.log(uid);
    dbinstance.collection("cartData").find({u_id:new ObjectId(uid)}).toArray().then((data)=>{
        //console.log(data);
        res.render("adminCart",{d:data});
    })
})
router.post("/remove",(req,res)=>{
    let d=req.body;
    let id=d.id;
    dbinstance.collection("cartData").deleteOne({_id:new ObjectId(id)}).then((data)=>{
    });
    res.redirect("/adminCart");
})
router.post("/qtydec",(req,res)=>{
    //console.log("qtydec called");
    const uid=req.session.adminId;
    const pid=req.body.id;
    //console.log(uid);
    //console.log(pid);
    dbinstance.collection("cartData").findOne({$and:[{"u_id":new ObjectId(uid)},{"_id":new ObjectId(pid)}]}).then((d)=>{
    const myQuery={"u_id":new ObjectId(uid),"_id":new ObjectId(pid)};
    //console.log(d);
    //res.end();
    dbinstance.collection("cartData").updateOne(myQuery,{$set:{"quantity":d.quantity-1}}).then((f)=>{
        res.redirect("/cpage");
    });
    });
})
router.post("/qtyinc",(req,res)=>{
    const uid=req.session.adminId;
    const pid=req.body.id;
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
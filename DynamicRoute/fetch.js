// const express = require("express");
// const app = express();
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
const MongoClient = require("mongodb").MongoClient;
async function connectToDatabase() {
    try {
        const client = await MongoClient.connect("mongodb://localhost:27017");
        const db = client.db("ProductData");
        console.log("Database connected...");
        return db;
    } catch (err) {
        console.log(err);
        process.exit(1); 
    }
}

async function fetchData(db) {
    try {
        const data = await db.collection("Data").find({}).toArray();
        console.log("Fetch Data Complete");
        //console.log(data);
        return data;
    } catch (err) {
        console.log(err);
    }
}

async function main() {
    const db = await connectToDatabase();
    const data = await fetchData(db);
    // Continue with other operations or server setup that depends on the fetched data
    module.exports={"d":data};
}
main();


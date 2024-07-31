const express = require("express")
const cors = require("cors")
const { MongoClient, ObjectId } = require("mongodb");
const app = express();
app.use(express.json());
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();


const url = "mongodb://localhost:27017";


app.use(
    cors({
        origin: "http://localhost:3000"
    })
)

app.post("/create", async (req, res) => {
    try {
        const connection = await MongoClient.connect(url);
        const db = connection.db("task");
        await db.collection("todo").insertOne(req.body);
        await connection.close();
        res.json({ mesaage: "Task Created" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ mesaage: "something went wrong" })

    }
})

app.get("/home/:id", async (req, res) => {
    try {
        const connection = await MongoClient.connect(url);
        const db = connection.db("task");
        const objId = new ObjectId(req.params.id);
        const store = await db.collection("todo").findOne({ _id: objId });
        res.json(store);
        await connection.close();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: " Somthing went Wrong" })
    }
})

app.put("/home/:id", async (req, res) => {
    try {
        const connection = await MongoClient.connect(url);
        const db = connection.db("task");
        const objId = new ObjectId(req.params.id);
        console.log(objId)
        await db.collection("todo").findOneAndUpdate({_id: objId},{$set: req.body});
        await connection.close();
        res.json({ message: "Task updated"});
    } catch (error) {
        console.log(error)
        res.status(500).json({meaage: "Something went wrong"})
    }
})

app.delete("/home/:id" , async(req,res)=>{
    try {
        const connection = await MongoClient.connect(url);
        const db = connection.db("task");
        const objId = new ObjectId(req.params.id);
        const store = await db.collection("todo").deleteOne({_id:objId});
        await connection.close();
        res.json({ message : "Task Deleted"})
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went Wrong"})
    }
})

app.post("/login", async (req, res) => {
    try {
      const connection = await MongoClient.connect(url);
      const db = connection.db("task");
      const loginuser = await db
        .collection("user")
        .findOne({ email: req.body.email });
      // console.log(loginuser);
      if (loginuser) {
        const password = bcrypt.compareSync(
          req.body.password,
          loginuser.password
        );
        if (password) {
          const token = jwt.sign({ id: loginuser._id }, process.env.SECRETKEY);
          res.json({ message: "Login Success", token, loginuser });
        } else {
          res.status(401).json({ message: "Password Incorrect" });
        }
      } else {
        res.status(401).json({ message: "User not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(401).json({ message: "Something went wrong" });
    }
  });

  app.post("/register", async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      req.body.password = hash;
      const connection = await MongoClient.connect(url);
      const db = connection.db("task");
      const user = await db.collection("user").insertOne(req.body);
      await connection.close();
      res.json({ message: "User Registered Scccessfully" });
    } catch (error) {
      console.log(error);
      res.json({ message: "User Not Registered" });
    }
  });


app.listen(3005)
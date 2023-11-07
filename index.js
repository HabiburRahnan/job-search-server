const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.JOB_USER}:${process.env.JOB_PASS}@cluster0.uzdqwnz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const jobCollection = client.db("jobSearch").collection("allJobs");
    const applyJobCollection = client.db("jobSearch").collection("applyJob");

    // auth related api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res.send(token);
    });

    // apply job related api
    app.post("/applyJob", async (req, res) => {
      const addedJob = req.body;
      const result = await applyJobCollection.insertOne(addedJob);
      res.send(result);
    });

    // app.get("/applyJob", async (req, res) => {
    //   // console.log(req.query?.email);
    //   let query = {};
    //   if (req.query?.email) {
    //     query = { email: req.query.email };
    //   }
    //   const result = await jobCollection.find(query).toArray();
    //   res.send(result);
    // });
    app.get("/applyJob", async (req, res) => {
      const cursor = applyJobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // job related api

    app.get("/job", async (req, res) => {
      // console.log(req.query?.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await jobCollection.find(query).toArray();
      res.send(result);
    });

    //  job  deleted related api
    app.delete("/addNewJob/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/addNewJob", async (req, res) => {
      const cursor = jobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // job updated related api
    app.put("/addNewJob/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedJob = req.body;
      const product = {
        $set: {
          job_title: updatedJob.job_title,
          displayName: updatedJob.displayName,
          description: updatedJob.description,
          job_type: updatedJob.job_type,
          salary: updatedJob.salary,
          photo: updatedJob.photo,
          postingDate: updatedJob.postingDate,
          applicationDate: updatedJob.applicationDate,
          applicationNumber: updatedJob.applicationNumber,
        },
      };
      const result = await jobCollection.updateOne(filter, product, options);
      res.send(result);
    });

    app.get("/addNewJob/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(query);
      res.send(result);
    });

    app.post("/addNewJob", async (req, res) => {
      const newJob = req.body;
      const result = await jobCollection.insertOne(newJob);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("job search project running");
});

app.listen(port, () => {
  console.log(`job search server is running on port: ${port}`);
});

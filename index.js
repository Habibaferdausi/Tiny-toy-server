const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
require("dotenv").config();
//middle

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ehup0wf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const toysCollections = client.db("zooZone").collection("toys");

    const indexKeys = { name: 1 };
    const indexOptions = { name: "title" };
    const result = await toysCollections.createIndex(indexKeys, indexOptions);

    app.get("/toySearch/:text", async (req, res) => {
      const search = req.params.text;

      const result = await toysCollections
        .find({
          $or: [{ name: { $regex: search, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });

    app.post("/addToy", async (req, res) => {
      const toys = req.body;
      console.log(toys);
      const result = await toysCollections.insertOne(toys);

      res.send(result);
      console.log(result);
    });

    app.get("/allToys", async (req, res) => {
      const type = req.query.type === "ascending";

      const result = await toysCollections
        .find({})
        .sort({ price: 1 })
        .limit(20)
        .toArray();

      res.send(result);
    });

    //for my toys

    app.get("/myToys/:email", async (req, res) => {
      console.log(req.params.id);
      const toys = await toysCollections
        .find({
          sellerEmail: req.params.email,
        })

        .sort({ price: -1 })
        .toArray();
      res.send(toys);
    });

    app.get("/toy/:id", async (req, res) => {
      console.log(req.params.id);
      const toys = await toysCollections.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(toys);
    });

    app.get("/allToys/:text", async (req, res) => {
      console.log(req.params.text);
      if (
        req.params.text === "teddyBear" ||
        req.params.text === "horse" ||
        req.params.text === "dinosaur"
      ) {
        const result = await toysCollections
          .find({ subCategory: req.params.text })
          .toArray();
        console.log(result);
        return res.send(result);
      }
      const result = await toysCollections.find({}).toArray();

      res.send(result);
    });

    app.put("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log(data);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          price: data.price,
          quantity: data.quantity,
          description: data.description,
        },
      };
      const result = await toysCollections.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollections.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("connected");
});
app.listen(5000, () => {
  console.log("server is running on port 5000");
});

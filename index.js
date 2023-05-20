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
  // Connect the client to the server	(optional starting in v4.7)

  try {
    const toysCollections = client.db("zooZone").collection("toys");
    app.get("/allToys", async (req, res) => {
      const result = await toysCollections.find({}).limit(20).toArray();

      res.send(result);
    });

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

    //for my toys

    app.get("/myToys/:email", async (req, res) => {
      const { email } = req.params;
      const { sort } = req.query;

      const sortOptions = {
        ascending: { price: 1 },
        descending: { price: -1 },
      };

      const toys = await toysCollections
        .find({ sellerEmail: email })
        .sort(sortOptions[sort])
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

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5844;
const mongoURI = process.env.MONGO_URI;
app.use(express.json());
const corsConfig = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}
app.use(cors(corsConfig));




const client = new MongoClient(mongoURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

let db;

async function connectToDatabase(client) {
    if (db) {
        return { client, db };
    }
    try {
        await client.connect();
        db = client.db("ncc-lms-db");
        await db.command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        return { client, db };
    } catch (e) {
        console.error(e);
        throw e;
    }
}

app.get('/', (req, res) => {
    res.send('Backend Server Running...');
});

app.post('/items', async(req, res) => {
    try {
        const { db } = await connectToDatabase(client);

        if (!db) {
            return res.status(500).json({ message: 'Database not connected' });
        }
        const { name, quantity } = req.body;
        const newItem = { name, quantity };

        const collection = db.collection("items");
        const result = await collection.insertOne(newItem);

        res.status(201).json({ message: 'Item added successfully', item: result });

    } catch (error) {
        console.error("Item-error:", error);
        res.status(500).json({ message: 'Failed to add item', error });
    }

});

app.listen(port, () => {
    console.log(console.log(`Server is running on port ${port}`))
})
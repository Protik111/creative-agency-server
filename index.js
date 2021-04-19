const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
require('dotenv').config()

const port = 5000

const app = express()
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('File'));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z2l8a.mongodb.net/creativeAgency?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
    res.send('Hello World!')
  })


client.connect(err => {
  const orderCollection = client.db("creativeAgency").collection("userOrders");
  app.post('/addOrder', (req, res) => {
      const orders = req.body;
    //   console.log(orders);
      orderCollection.insertOne(orders)
      .then(result =>{
          res.send(result.insertedCount);
      })
  })

  const adminAddService = client.db("creativeAgency").collection("services");
  app.post('/adminAddService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;

    const filePath = `${__dirname}/File/${file.name}`;
    file.mv(filePath, err => {
      if(err){
        console.log(err);
        return res.status(500).send({msg : 'Failed To Upload'});
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');

      var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      image: Buffer(encImg, 'base64')
    }
      adminAddService.insertOne({title, description, image})
      .then(result => {
        fs.remove(filePath, error =>{
          if(error){console.log(error)}
          res.send(result.insertedCount > 0)
        })
      })
    })



    // const newImg = req.files.file.data;
    // const encImg = newImg.toString('base64');
    // var image = {
    //   contentType: req.files.file.mimetype,
    //   size: req.files.file.size,
    //   img: Buffer(encImg, 'base64')
    // }
    // servicesCollection.insertOne({ title, description, image })
    //   .then(result => {
    //     res.send(result.insertedCount > 0)
    //   })


    // console.log(file, title, description);
    // file.mv(`${__dirname}/File/${file.name}`, err => {
    //   if(err){
    //     console.log(err);
    //     return res.status(500).send({msg : 'Failed To Upload'});
    //   }
    //   return res.send({name : file.name, path: `/${file.name}`})
    // })

    // const services = req.body;
    // // console.log(services);
    // adminAddService.insertOne(services)
    // .then(result => {
    //   res.send(result.insertedCount);
    // })
  })

  const addAdmin = client.db("creativeAgency").collection("admin");
  app.post('/addAdmin', (req, res) => {
    const admin = req.body;
    // console.log(admin);
    addAdmin.insertOne(admin)
    .then(result => {
      res.send(result.insertedCount);
    })
  })

  const reviewCollection = client.db("creativeAgency").collection("feedbacks");
  app.post('/addReview', (req, res) => {
      const review = req.body;
    //   console.log(review);
      reviewCollection.insertOne(review)
      .then(result =>{
          res.send(result.insertedCount);
      })
  })

  //inserting bulk services data
  const serviceCollection = client.db("creativeAgency").collection("services");
  app.post('/addServices', (req, res) => {
      const services = req.body;
    //   console.log(review);
      serviceCollection.insertMany(services)
      .then(result =>{
          res.send(result.insertedCount);
      })
  })

  //inserting bulk feedback data
  const feedbackCollection = client.db("creativeAgency").collection("feedbacks");
  app.post('/addFeedback', (req, res) => {
      const feedback = req.body;
    //   console.log(review);
      feedbackCollection.insertMany(feedback)
      .then(result =>{
          res.send(result.insertedCount);
      })
  })

  const showServices = client.db("creativeAgency").collection("services");
  app.get('/showServices', (req, res) => {
      showServices.find({})
      .toArray((err, documents) => {
          res.send(documents);
      })
  })

  const showUserOrders = client.db("creativeAgency").collection("userOrders");
  app.get('/showOrders', (req, res) => {
    showUserOrders.find({})
    .toArray((err, documents) => {
      res.send(documents);
    })
  })

  
  const showFeedbacks = client.db("creativeAgency").collection("feedbacks");
  app.get('/showFeedbacks', (req, res) => {
      showFeedbacks.find({})
      .toArray((err, documents) => {
          res.send(documents);
      })
  })

//   console.log('db connected');
  // perform actions on the collection object
  //client.close();
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
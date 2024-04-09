const express = require('express');
const router = express.Router();
require('dotenv').config()
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");
const jwtString = process.env.JWT_STRING

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  ourId: { type: String, required: true },
  anArray: { type: Array, required: false },
  anObject: { type: Object, required: false }
})
const userSchema = new Schema({
  email: { type: String, required: true },
  cartId: { type: Number, required: true },
  password: { type: String, required: true },

})

const Product = mongoose.model('Product', productSchema) // 'Product' refers to the collection, so maps products collection to productSchema; see lecture notes

const User = mongoose.model('User', userSchema)

 

const Auth = require('./auth')
 
router.get('/addProduct', Auth, (req, res, next) => {
  let productId = 10
  const name = req.query.name
  const price = req.query.price
  Product.countDocuments({},(err, count) => {
    
  console.log(count)
  try {
    const prod = new Product({
      name: name,
      price: price,
      ourId:count + 1,
    })
    prod.save().then(() => {
      console.log('saved product to database')
      res.send({ success: true,message: 'Success' })
    })
  } catch (err) {
    console.log('failed to addAproduct: ' + err)
    res.send({ success: false, message: 'Unsuccessful' })
  }
})
})
 


router.get('/', (req, res, next) => {
  Product.find() // Always returns an array
    .then(products => {
      res.send({ success: true,'All the Products': products })
    })
    .catch(err => {
      console.log('Failed to find: ' + err)
      res.send({ success: false,'Products': [] })
    })
})
router.get('/showUsers', (req, res, next) => {
  User.find() // Always returns an array
    .then(users => {
      res.send({success: true, 'All the Users': users })
    })
    .catch(err => {
      console.log('Failed to find: ' + err)
      res.send({ success: false,'Products': [] })
    })
})

router.post('/', (req, res, next) => {
  console.log(req.body.testData)
  Product.find() // Always returns an array
    .then(products => {
      res.json({ 'POST Mongoose Products': products })
    })
    .catch(err => {
      console.log('Failed to find: ' + err)
      res.json({ 'Products': [] })
    })
})

router.get('/getSpecificProduct', (req, res, next) => {
  Product.find({ ourId: '1' }) // Always returns an array
    .then(products => {
      res.send('getSpecificProduct: ' + JSON.stringify(products[0])) // Return the first one found
    })
    .catch(err => {
      console.log('Failed to find product: ' + err)
      res.send('No product found')
    })
})

router.get('/updateSpecificProduct', (req, res, next) => {
  Product.find({ ourId: '1' }) // Always returns an array
    .then(products => {
      let specificProduct = products[0] // pick the first match
      specificProduct.price = 99.95
      specificProduct.save() // Should check for errors here too
      res.redirect('/')
    })
    .catch(err => {
      console.log('Failed to find product: ' + err)
      res.send('No product found')
    })
})

router.get('/deleteSpecificProduct', (req, res, next) => {
  if (!req.session.loggedIn) {
    res.send({ success: false })
  }

  Product.findOneAndRemove({ ourId: '0' })
    .then(resp => {
      res.send({ success: true })
    })
    .catch(err => {
      console.log('Failed to find product: ' + err)
      res.send({ success: false })
    })
})


router.get('/signin', async (req, res, next) => {
  const email = req.query.email;
  const password = req.query.pass.trim(); // Trim the password
  
 
    const user = await User.findOne({ email: email });
  
    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }
    const checkPass = await bcrypt.compare(password + process.env.EXTRA_BCRYPT_STRING, user.password);
  
    if (checkPass) {
      res.setHeader('Set-Cookie', 'isLoggedIn=true');
      return res.json({ success: true, message: `Welcome: ${email}` });
    } else {
      console.log('Comparison failed');
      return res.json({ success: false, message: "Incorrect password" });
    }
 
});


router.get('/signup', (req, res, next) => {
  console.log(req.query.email)
  email = req.query.email.trim()
  password = req.query.pass.trim()
  password = bcrypt.hashSync(password + process.env.EXTRA_BCRYPT_STRING, 12)
  User.countDocuments({},(err, count) => {
    console.log(count)
  new User({ email: req.query.email , password: password, cartId: count + 1 })
    .save()
    .then(result => {
    
      console.log('saved user to database')
      res.redirect('/')
    })
    .catch(err => {
      console.log('failed to user: ' + err)
      res.redirect('/')
    })
  })
})

router.get('/signout', (req, res, next) => {
  let loggedIn = req.session.isLoggedIn
  req.session.isLoggedIn = false
  console.log(loggedIn)
  res.clearCookie('isLoggedIn')
  res.send({success: true,message:'done: ' + loggedIn})
})

exports.routes = router

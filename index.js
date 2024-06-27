const express = require('express')
const app = express()
const port = 4000
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const cors = require('cors')


app.use(express.json())
app.use(cors())


// database connection with mongodb

mongoose.connect("mongodb+srv://rohit:rohit1172@cluster0.wufy0ms.mongodb.net/e-commerce")

// api creation

app.get("/", (req, res) => {
    res.send("Hello from server")
})


// image storage engine

const storage = multer.diskStorage({
    destination: "./upload/images",
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})


const upload = multer({
    storage: storage
})


// creating upload enpoint for images

app.use("/images", express.static("upload/images"))

app.post("/upload", upload.single("product"), (req, res) => {

    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    })
})


// schema for creating products


const Product = mongoose.model("Product", {

    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    new_price: {
        type: Number,
        required: true
    },

    old_price: {
        type: Number,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    },

    available: {
        type: Boolean,
        default: true

    },



})

// endpoint for creating products

app.post("/addproduct", async (req, res) => {

    let products = await Product.find({})

    let id;

    if (products.length > 0) {
        let last_product_array = products.slice(-1);

        let last_product = last_product_array[0];

        id = last_product.id + 1;
    }
    else {
        id = 1;
    }

    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,


    })

    console.log(product);

    await product.save();

    console.log("Product added successfully");

    res.json({
        success: true,
        name: req.body.name,
        // message : "Product added successfully"

    })
})


// creating api for deleting products

app.post("/removeproduct", async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id })

    console.log("Product removed successfully");


    res.json({
        success: true,
        name: req.body.name,
        message: "Product removed successfully"
    })
})



// creating api for getting all products

app.get("/allproducts", async (req, res) => {
    try {
        let products = await Product.find({});
        console.log("Products fetched successfully");
        res.json(products);  // Return the products array directly
    } catch (error) {
        console.error("Error fetching products: ", error);
        res.status(500).json({ success: false, error: error.message });
    }
})


// schema creating for user model



const Users = mongoose.model("Users", {
    name: {
        type: String,

    },

    email: {
        type: String,

        unique: true
    },

    password: {
        type: String,

    },

    cartData: {
        type: Object,

    },

    date: {
        type: Date,
        default: Date.now
    }

})

// creating endpoint for regestering users

app.post("/signup", async (req, res) => {


    let check = await Users.findOne({ email: req.body.email })

    if (check) {
        return res.status(400).json({
            success: false,
            message: "User already exists"
        })

    }


    let cart = [];

    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }

    const user = new Users({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        cartData: cart

    })

    await user.save();

    // jwt token generation
    const data = {

        user: {
            id: user.id

        }

    }

    const token = jwt.sign(data, "secret_ecom");

    res.json({
        success: true,
        token: token,
        message: "User registered successfully"
    })

})


// creating endpoint for login

app.post("/login", async (req, res) => {

    let user = await Users.findOne({ email: req.body.email })





    if (user) {
        const passCompare = user.password === req.body.password;

        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }


            const token = jwt.sign(data, "secret_ecom");

            res.json({
                success: true,
                token: token,
                message: "User logged in successfully"
            })
        }
        else {
            res.json({
                success: false,
                message: "Password is incorrect"
            })

        }
    }
    else {
        res.json({
            success: false,
            message: "User not found"
        })

    }
})






app.listen(port, (err) => {
    if (!err) {
        console.log('server is running on port', port)
    }

    else {
        console.log('server is not running')
    }
})
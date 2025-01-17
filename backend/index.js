const port = 4000;
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

app.use(express.json());
app.use(cors({
    origin: '*',
  credentials: true
}));

mongoose.connect("mongodb+srv://harshguptaji1210:1210304@cluster0.udgpysr.mongodb.net/e-commerce")

// API Creation

app.get("/", (req,res)=>{
    res.send("Express App is Running");
})

//Image Storage Engine

const storage = multer.diskStorage({
    destination: './upload/images',
    filename:(req,file,cb)=>{
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({ storage: storage })

//Creating Upload Endpoint for images

app.use('/images', express.static('upload/images'))

app.post('/upload', upload.single('product'), (req,res)=>{
    res.json({
        success: 1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

//Schema for Creating Products

const Product = mongoose.model("Product", {
    id:{
        type: Number,
        required: true,
    },

    name:{
        type: String,
        required: true,
    
    },
    image:{
        type: String,
        required: true,
    },
    category:{
        type: String,
        required: true,
    },
    new_price:{
        type: Number,
        required: true,
    },
    old_price:{
        type: Number,
        required: true,
    },
    date:{
        type: Date,
        default: Date.now,
    },
    available:{
        type: Boolean,
        default: true,  
    }
})

app.post('/addproduct',async (req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length>0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }
    else{
        id = 1;
    }
    const product = new Product({
        id:id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("saved");
    res.json({
        success: true,
        name: req.body.name,
    })

})

// Creating API for Deleting Products

app.post('/removeproduct',async (req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name
    })
})

//Creating API for Getting All Products
app.get('/allproducts',async (req,res)=>{
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})

// Schema creating for users model

const Users = mongoose.model('Users', {
	name:{
		type: String,
	},
	email:{
		type: String,
		required: true,
	},
	password:{
		type: String,
	},
	cartData:{
		type: Object,
	},
	date:{
		type: Date,
		default: Date.now,
	}
})

//Creating Endpoint for registring the user
app.post('signup',async(req,res)=>{
	let check = await Users.findOne({email:req.body.email});
	if(check){
        return res.status(400).json({success: false, error: "Email Already Exists"});
    }
	let cart = {};
	for(let i=1;i<300;i++){
        cart[i] = 0;
    }
	const user = new Users({
		name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    })
	await user.save();
	console.log("User Saved");
	
	const data = {
		user:{
			id:user.id
		}
	}
	const token = jwt.sign(data,'secret_ecom');
	res.json({success:true,token});
})

// Creating endpoint for user login
app.post('/login',async(req,res)=>{
	let user = await Users.findOne({email:req.body.email});
	if(user){
		const passCompare = req.body.password === user.password;
		if(passCompare){
			const data = {
				user:{
					id:user.id
				}
			}
			const token = jwt.sign(data,'secret_ecom');
			res.json({success:true,token});
		}
		else{
			res.json({success:false,errors:"Wrong Password"});
		}
	}
	else{
		res.json({success:false,errors:"Wrong Email Id"})
	}
})


const User = mongoose.model("User", {
    name:{
        type: String
        
    },
    email:{
        type: String,
        unique: true,
    },
    password:{
        type: String
        
    },
    cateData:{
        type: Object,
    },
    date:{
        type: Date,
        default: Date.now,
    }
})

//creating API for Registering User

app.post('/signup', async (req,res)=>{
    let check = await User.findOne({email:req.body.email});  
    if(check){
        return res.status(400).json({success: false, error: "Email Already Exists"});
    }
    let cart = {};
    for(let i=1;i<300;i++){
        cart[i] = 0;
    }
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    })
    await user.save();

    const data = {
        user:{
            id:user.id
        }
    }
      const token = jwt.sign(data,'secret_ecom');
      res.json({success:true,token});
})

//Creating emdpoint for user login

app.post('/login', async (req,res)=>{
    let user = await User.findOne({email:req.body.email});
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true,token})
    }
    else{
        res.json({success:false,errors:"Wrong Password"});
    }
    }
    else{
        res.json({success:false,errors:"Wrong Email Id"});
    }
})

//Creating endpoint for newcollection data
app.get('/NewCollections',async (req,res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("NewCollection Fetched")
    res.send(newcollection);
})

//Creating endpoint for popular in women section
app.get('/popularinwomen',async (req,res)=>{
	let products = await Product.find({category:"women"});
	let popular_in_women = products.slice(0,4);
	console.log("Popular in women fetched");
	res.send(popular_in_women);
})

const fetchUser = async (req,res,next)=>{
	const token = req.header('auth-token');
	if(!token){
		res.status(401).send({errors:"Please authenicate the valid token"})
	}
	else{
		try{
			const data = jwt.verify(token,'secret_ecom');
			req.user = data.user;
			next();
		} catch (error){
			res.status(401).send({errors:"please Authrnticate"})
		}
	}
}

//Creating endpoint for adding products in cartdata
app.post('/addtocart', fetchUser, async (req, res) => {
	console.log("Added", req.body.itemId);
  
	let userData = await Users.findOne({ _id: req.user.id });
	if (!userData.cartData) {
	  userData.cartData = {}; // Initialize cartData if it doesn't exist
	}
	
	if (!userData.cartData[req.body.itemId]) {
	  userData.cartData[req.body.itemId] = 0; // Initialize the item if it doesn't exist
	}
	
	userData.cartData[req.body.itemId] += 1; // Increment the item quantity
	await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
	res.send("added");
  });
  

//Creating endpoint for remove products from cartdata
app.post('/removefromcart', fetchUser, async (req, res) => {
    console.log("Removed", req.body.itemId);

    let userData = await Users.findOne({ _id: req.user.id });

    // Check if the item exists in the user's cart
    if (userData.cartData && userData.cartData[req.body.itemId] && userData.cartData[req.body.itemId] > 0) {
        userData.cartData[req.body.itemId] -= 1;
        await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
        res.send("removed");
    } else {
        res.status(400).send("Item not in cart or invalid item ID");
    }
});


//creating endpoint to get cartdata
app.post('/getcart',fetchUser,async (req,res)=>{
	console.log("GetCart");
	let userData = await Users.findOne({_id:req.user.id});
	res.json(userData.cartData);
})


app.listen(port,(error) => {
    if(!error){
        console.log("Server is running on port"+port)
    }
    else{
        console.log("Error : "+error)
    }
})

// 8.58 se dekhna hai
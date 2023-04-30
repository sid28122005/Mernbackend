require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const hbs = require('hbs');
const port = process.env.PORT || 8000;
require("./db/conn");
const Register = require("./models/registers");
const exp = require("constants");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

// console.log(process.env.SECRET_KEY);

app.get("/", (req, res) => {
    res.render("index");
})
//make a new file of hbs for secret & get the data of secret
app.get("/secret", auth, (req, res) => {
    //console.log(`this is the cookie awesome ${req.cookies.jwt}`);
    res.render("secret");
})

app.get("/register", (req,res) => {
    res.render("register");
})

app.get("/register", (req,res) => {
    res.render("register");
})

app.get("/login", (req,res) => {
    res.render("login");
})

app.get("/logout", auth, async(req,res) => {
    try {
        console.log(req.user);

        //filter(elem,index,array,this)
        //for single logout
        // req.user.tokens = req.user.tokens.filter((currElement) => {
        //     return currElement.token !== req.token
        // })

        //logout for all devices
        req.user.tokens = [];

        res.clearCookie("jwt");
        console.log("logout successfully")
        await req.user.save();
        res.render("login");
    } catch (error) {
        res.status(500).send(error);
    }
})

app.post("/register", async (req,res) => {
    try {

        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if(password === cpassword) {

            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: password,
                confirmpassword: cpassword
            })

            console.log("the success part" + registerEmployee);

            const token = await registerEmployee.generateAuthToken();
            console.log("the token part" + token);

            res.cookie("jwt",token, {
                expires: new Date(Date.now() + 3000),
                httpOnly:true
            });
            console.log(cookie);

            const registered = await registerEmployee.save();
            console.log("the page part" + registered);

            res.status(201).render("index");

        }

        else{
            res.send("password are not matching")
        }
    } 
    catch (error) {
        res.status(400).send(error);
    }
})

//login check

app.post("/login", async(req,res) => {
    try {
        
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({email:email});

        const isMatch = await bcrypt.compare(password, useremail.password);

        const token = await useremail.generateAuthToken();
        console.log("the token part" + token);

        res.cookie("jwt",token, {
            expires: new Date(Date.now() + 600000),
            httpOnly:true,
            //secure:true only for https
        });



        if(isMatch){
            res.status(201).render("index");
        }else{
            res.send("invalid Password details");
        }

    } catch (error) {
        res.status(400).send("invalid login details");
    }
})

//one way communication

// const bcrypt = require("bcryptjs");

// const securePassword = async (password) => {

//     const passwordHash = await bcrypt.hash(password, 10);
//     console.log(passwordHash);

//     const passwordmatch = await bcrypt.compare("sakshi@123" , passwordHash);
//     console.log(passwordmatch);
// }

// securePassword("sakshi@123");



//generate token & check for authentication

// const jwt = require("jsonwebtoken");


// const createToken = async() => {
//     const token = await jwt.sign({_id: "6448ae6b1bc154e61a7f9328"}, "mynameisssakshikrushnawanare", {
//         expiresIn:"4 seconds"
//     });
//     console.log(token);

//     const userver = await jwt.verify(token, "mynameissakshikrushnawanare");
//     console.log(userver);
// }

// createToken();

app.listen(port , () => {
    console.log(`connection successful at port ${port}`);
});


// the res.cookie() function is used to set the cookie name to value.
// the value parameter may be a string or object converted to json

//syntax:

//res.cookie(name, value, [options])

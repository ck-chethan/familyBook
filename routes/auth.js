const router = require("express").Router();
const User = require("../models/User");
var bcrypt = require('bcryptjs');

//Register

router.post("/register", async (req, res) => {

    try {
        //Hash Password
        const salt = await bcrypt.genSaltSync(10);
        const hashPassword = await bcrypt.hashSync(req.body.password, salt);

        //Create Object
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashPassword
        });

        //Save onto Database
        const user = await newUser.save();
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }

});

//Login

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        !user && res.status(404).send("404 No user found");

        const validPassword = await bcrypt.compareSync(req.body.password, user.password);
        !validPassword && res.status(400).json("Wrong Password");
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }

});


// Test in Local
// router.get("/register", async (req, res) => {

//     const user = await new User({
//         username: "chethan",
//         email: "chetan@ck.com",
//         password: "1234567"
//     });
//     await user.save();
//     res.send("ok");
// });

module.exports = router;
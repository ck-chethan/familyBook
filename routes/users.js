const router = require("express").Router();
const User = require("../models/User");
var bcrypt = require('bcryptjs');
const e = require("express");

//Update user
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSaltSync(10);
                req.body.password = await bcrypt.hashSync(req.body.password, salt);

            } catch (err) {
                res.status(500).json(err);
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body });
            if (user) {
                res.status(200).send("Account has been updated succesfully");
            }
            else {
                res.status(404).json("No user found to update");
            }

        } catch (err) {
            res.status(500).json(err);
        }

    } else {
        res.status(403).json("You can update only your account!");
    }
});

//Delete user
router.delete("/:id", async (req, res) => {
    console.log(req.body.userId);
    console.log(req.params.id);
    if (req.body.userId === req.params.id || req.body.isAdmin) {

        try {
            const user = await User.findByIdAndDelete(req.params.id);
            console.log(user);
            if (user) {
                res.status(200).send("Account has been deleted succesfully");
            } else {
                res.status(404).json("No user found to delete");
            }

        } catch (err) {
            res.status(500).json(err);
        }

    } else {
        res.status(403).json("You can delete only your account!");
    }
});


//Get a user
router.get("/", async (req, res) => {
    const userId = req.query.userId
    const username = req.query.username
    try {
        const user = userId ? await User.findById(userId) : await User.findOne({ username: username });
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json(other);

    } catch (err) {
        res.status(500).json(err);
    }
});

//Get Friends
router.get("/friends/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const friends = await Promise.all(
            user.followings.map(friendId => { return User.findById(friendId) })
        )
        let friendList = [];
        friends.map(friend => {
            const { _id, username, profilePicture } = friend
            friendList.push({ _id, username, profilePicture });
        });
        res.status(200).json(friendList);
    } catch (err) {
        res.status(500).json(err);
    }
});

//Follow a user
router.put("/:id/follow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                res.status(200).send("User has been followed");
            } else {
                res.status(403).json("You're already following me");
            }

        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).send("You can't follow yourself");
    }

});


//Unfollow a user
router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                res.status(200).send("User has been unfollowed");
            } else {
                res.status(403).json("You're not following me");
            }

        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).send("You can't unfollow yourself");
    }

});


module.exports = router;
const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//Create Post
router.post("/", async (req, res) => {
    const newPost = new Post(req.body);
    try {
        const savedPost = await newPost.save();
        if (savedPost) {
            res.status(200).json(savedPost);
        } else {
            res.status(404).json("No data present in post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});


//Update Post
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            const updatedPost = await post.updateOne({ $set: req.body });
            res.status(200).json("Post has been updated");
        } else {
            res.status(403).json("You can update only your posts");
        }
    } catch (err) {
        res.status(500).json(err);
    }

});


//Delete Post
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json("Post has been deleted");
        } else {
            res.status(403).json("You can only delete your posts");
        }
    } catch (err) {
        res.status(500).json(err);
    }

});


//Like a Post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            res.status(200).send("You've liked the Post");
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).send("You've unliked the Post");
        }
    } catch (err) {
        res.status(500).json(err);
    }

});


//Get a Post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            res.status(200).json(post);
        } else {
            res.status(404).json("Post not found");
        }

    } catch (err) {
        res.status(500).json(err);
    }
});


//Get Timeline Posts
router.get("/timeline/:userId", async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({ userId: currentUser._id });
        const friendPosts = await Promise.all(currentUser.followings.map(friendId => {
            return Post.find({ userId: friendId });
        }));
        res.status(200).json(userPosts.concat(...friendPosts));
    } catch (err) {
        res.status(500).json(err);
    }
});

//Get Users all Posts
router.get("/profile/:username", async (req, res) => {
    try {
        console.log(req.params.username);
        const user = await User.findOne({ username: req.params.username })
        console.log(user);
        const posts = await Post.find({ userId: user._id })
        res.status(200).json(posts)
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
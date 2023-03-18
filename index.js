const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  follower: {
    type: [],
  },
  following: {
    type: [],
  },
});

const postSchema = new Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  comment: {
    type: [],
  },
  likes: {
    type: Number,
    // default: 0
  },
});

const Post = new mongoose.model("Post", postSchema);
const User = new mongoose.model("User", userSchema);

mongoose
  .connect("mongodb://localhost:27017/blog")
  .then(() => app.listen("8000", (req, res) => console.log("Hello at 8000")))
  .then(() => console.log("connected"))
  .catch((err) => console.log(err));

app.post("/api/authenticate", (req, res) => {
  var token = jwt.sign({ email: req.body.email }, "usertoken");
  const testdata = new User({
    email: req.body.email,
    password: req.body.password,
  });
  testdata.save();
  res.send(token);
});

app.post("/api/follow/:id", (req, res) => {
  User.find({}).then((result) => {
    result[0].follower.push(req.params.id);
    result[0].save();
  });
});

app.post("/api/unfollow/:id", (req, res) => {
  User.find({}).then((result) => {
    let index = result[0].follower.indexOf(req.params.id);
    result[0].follower.splice(index, 1);
    result[0].save();
  });
});

app.get("/api/user", (req, res) => {
  User.find({}).then((result) => {
    let followers = result[0].follower;
    let countf = 0;
    followers.forEach((follower) => {
      countf += 1;
    });
    let followings = result[0].following;
    let count = 0;
    followings.forEach((following) => {
      count += 1;
    });
    let user = {
      UserName: result[0].email,
      Followers: countf,
      Following: count,
    };
    res.send(user);
  });
});

app.post("/api/posts", (req, res) => {
  const postdata = new Post({
    title: req.body.title,
    description: req.body.description,
    likes: req.body.likes,
  });
  postdata.save();
  res.send(postdata);
});

app.delete("/api/posts/:id", (req, res) => {
  Post.findByIdAndDelete(req.params.id).then((result) => {
    if (result) {
      res.send("Deleted");
    }
    res.send("id not found");
  });
});

app.post("/api/like/:id", (req, res) => {
  Post.findById(req.params.id).then((result) => {
    result.likes += 1;
    result.save();
    res.send("Liked the post");
  });
});

app.post("/api/unlike/:id", (req, res) => {
  Post.findById(req.params.id).then((result) => {
    result.likes -= 1;
    result.save();
    res.send("Unliked the post");
  });
});

app.post("/api/comment/:id", (req, res) => {
  Post.findById(req.params.id).then((result) => {
    result.comment.push(req.body);
    result.save();
    res.send("Comment-id:" + result.comment.length);
  });
});

app.get("/api/posts/:id", (req, res) => {
  Post.findById(req.params.id).then((result) => {
    let count = 0;
    let comments = result.comment;
    comments.forEach((comment) => {
      count += 1;
    });
    const allpost = {
      title: result.title,
      desc: result.description,
      created_at: result.time,
      comments: count,
      likes: result.likes,
    };
    res.send(allpost);
  });
});

app.get("/api/all_posts", (req, res) => {
  Post.find().then((result) => {
    const allpost = {
      id: result[0]._id,
      title: result[0].title,
      desc: result[0].description,
      created_at: result[0].time,
      comment: result[0].comment,
      likes: result[0].likes,
    };
    res.send(allpost);
  });
});

//
const express = require("express");

const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");

const galleryRoute = require("./routes/gallery");
const storyRoute = require("./routes/story");
const postRoute = require("./routes/posts");
const contactRoute = require("./routes/contact");
const decodeIDToken = require("./utility/authenticateToken");

const app = express();
app.use(express.json());
app.use(cors());
app.use(decodeIDToken);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`MongoDB Connected...`))
  .catch((err) => console.log(err));

// Serve static assets if in production

app.use(express.static("client/build"));

//ContactRoute
app.use("/api/contact", contactRoute);

//PostRoute
app.use(
  "/api/postimages",
  express.static(path.join(__dirname, "../postimages/"))
);
app.use("/api/posts", postRoute);

//StoryRoute
app.use(
  "/api/storyimages",
  express.static(path.join(__dirname, "../storyimages/"))
);
app.use("/api/stories", storyRoute);

//GalleryRoute
app.use("/api/gallery", galleryRoute);
app.use(
  "/api/galleryimages",
  express.static(path.join(__dirname, "../galleryimages/"))
);

//Multer storage settings for galleryimages
const storagegallery = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "galleryimages");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

//Multer storage settings for storyimages
const storagestory = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "storyimages");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

//Multer storage settings for postimages
const storagepostimg = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "postimages");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

//Multer image upload settings for all routes
const authAndLimitErrorHandler = (err, req, res, next) => {
  if (err) {
    res.sendStatus(413);
  }
  const auth = req.currentUser;
  if (!auth) {
    res.sendStatus(413);
  } else {
    next();
  }
};

const ffilter = function (req, file, cb) {
  if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
    req.fileValidationError = "Forbidden extension";
    return cb(null, false, req.fileValidationError);
  }
  cb(undefined, true); //Continue with upload
};
const filelimits = { fileSize: 3000000 }; //Max file size 1MB = 1000000 bytes

//Upload settings merged for the different routes (gallery, post, story)
const uploadgallery = multer({
  storage: storagegallery,
  limits: filelimits,
  fileFilter: ffilter,
});

const uploadstory = multer({
  storage: storagestory,
  limits: filelimits,
  fileFilter: ffilter,
});

const uploadpost = multer({
  storage: storagepostimg,
  limits: filelimits,
  fileFilter: ffilter,
});

//Galleryimage upload route
app.post(
  "/api/uploadgallery/",
  uploadgallery.single("file"),
  authAndLimitErrorHandler,
  (req, res) => {
    res.status(200).json("Data uploaded!");
  }
);

//Storyimage upload route
app.post(
  "/api/uploadstory/",
  uploadstory.single("file"),
  authAndLimitErrorHandler,
  (req, res) => {
    res.status(200).json("Data uploaded!");
  }
);

//Postimage upload route
app.post(
  "/api/uploadpost/",
  uploadpost.single("file"),
  authAndLimitErrorHandler,
  (req, res) => {
    res.status(200).json("Data uploaded!");
  }
);

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// index.html for all page routes
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
});

//When running on digital ocean, use process.env.PORT
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server Running on port: ${port}`);
});

const path = require("path");

const fs = require("fs");

const https = require("https");

const express = require("express");

const multer = require("multer");

const bodyParser = require("body-parser");

const errorController = require("./controllers/error");

const mongoose = require("mongoose");

const cookieParser = require("cookie-parser");

const session = require("express-session");

const MongoDBStore = require("connect-mongodb-session")(session);

const csrf = require("csurf");

const flash = require("connect-flash");

const User = require("./mongoose-models/user");

const helmet = require("helmet");

const compression = require("compression");

const morgan = require("morgan");

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, getRandomNumber(0, 1001) + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const mimeType = file.mimetype;
  if (
    mimeType === "image/png" ||
    mimeType === "image/jpg" ||
    mimeType === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGO_DB_URL,
  collection: "sessions",
});

const csrfProtection = csrf();

//read private key
// const privateKey = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const loginroutes = require("./routes/auth");

const accesLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

//middlewares

app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accesLogStream }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use(cookieParser());

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(flash());

app.use(csrfProtection);

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(loginroutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Server side error",
    path: "/500",
    isLoggedIn: req.session.isLoggedIn,
  });
});

mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => {
    // https.createServer({key: privateKey, cert: certificate},app).listen(process.env.PORT || 3004); //server in https mode but not needed manually since i am going to host it
    app.listen(process.env.PORT || 3004);
  })
  .catch((err) => console.log(err));

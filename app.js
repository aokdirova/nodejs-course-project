const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");

const mongoose = require("mongoose");

const cookieParser = require("cookie-parser");

const session = require("express-session");

const MongoDBStore = require("connect-mongodb-session")(session);

const User = require("./mongoose-models/user");

const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGO_DB_URL,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const loginroutes = require("./routes/auth");

//middlewares
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(loginroutes);

app.use(errorController.get404);

mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => {
    app.listen(3004);
  })
  .catch((err) => console.log(err));

const User = require("../mongoose-models/user");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isLoggedIn: req.session.isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  User.findById("65a13e78645dac16c8475821")
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
    })
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

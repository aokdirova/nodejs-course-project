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
      req.session.save(() => {
        res.redirect("/");
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isLoggedIn: false,
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        return res.redirect("/signup");
      }
      const newUser = new User({
        email: email,
        password: password,
        cart: { items: [] },
      });
      return newUser.save();
    })
    .then(() => {
      res.redirect("/login");
    })
    .catch((err) => console.log(err));
};

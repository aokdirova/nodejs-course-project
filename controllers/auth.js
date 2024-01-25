const User = require("../mongoose-models/user");
const bcrypt = require("bcryptjs");

const crypto = require("crypto");

const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const user = require("../mongoose-models/user");

const { validationResult } = require("express-validator");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

exports.getLogin = (req, res, next) => {
  let errorMesssage = req.flash("loginError");
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: errorMesssage.length > 0 ? errorMesssage[0] : null,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("loginError", "Invalid Password or Email");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(() => {
              res.redirect("/");
            });
          }
          req.flash("loginError", "Invalid Password or Email");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          return res.redirect("/login");
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
  let errorMesssage = req.flash("userExists");
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isLoggedIn: false,
    errorMessage: errorMesssage.length > 0 ? errorMesssage[0] : null,
    oldInput: {
      enteredEmail: "",
      enteredPassword: "",
      enteredConfirmPassword: "",
    },
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      isLoggedIn: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        enteredEmail: email,
        enteredPassword: password,
        enteredConfirmPassword: confirmPassword,
      },
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashedPass) => {
      const newUser = new User({
        email: email,
        password: hashedPass,
        cart: { items: [] },
      });
      return newUser.save();
    })
    .then(() => {
      res.redirect("/login");
      return transporter.sendMail({
        to: email,
        from: "aokdirova@gmail.com",
        subject: "Sign up successfull",
        html: "<h1> You signed up for spending money on useless stuff. Congrats! </h1>",
      });
    })
    .catch((err) => console.log("mailing service error", err));
};

exports.getReset = (req, res, next) => {
  let errorMesssage = req.flash("resetError");
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset password",
    errorMessage: errorMesssage.length > 0 ? errorMesssage[0] : null,
  });
};

exports.postReset = (req, res, next) => {
  const { email } = req.body;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash("resetError", "No account with that email found");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(() => {
        res.redirect("/");
        return transporter.sendMail({
          to: email,
          from: "aokdirova@gmail.com",
          subject: "Password reset",
          html: `
          <p> You requested a password reset </p>
          <p> Click this <a href="http://localhost:3004/reset/${token}"> link </a>  link to set a new password </p>
          `,
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      let errorMesssage = req.flash("resetError");
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "Set a new password",
        errorMessage: errorMesssage.length > 0 ? errorMesssage[0] : null,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const { newPassword, userId, passwordToken } = req.body;
  let resetUser;
  User.findOne({
    _id: userId,
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        req.flash("newPasswordError", "Cannot find user");
        return res.redirect("/reset");
      }
      resetUser = user;
      return bcrypt
        .hash(newPassword, 12)
        .then((hashedPass) => {
          resetUser.password = hashedPass;
          resetUser.resetToken = undefined;
          resetUser.resetTokenExpiration = undefined;
          return resetUser.save();
        })
        .then(() => {
          res.redirect("/login");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

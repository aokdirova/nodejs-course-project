const express = require("express");

const loginController = require("../controllers/auth");

const router = express.Router();

const { check, body } = require("express-validator");

const User = require("../mongoose-models/user");

///controllers

router.get("/login", loginController.getLogin);

router.get("/signup", loginController.getSignup);

router.get("/reset", loginController.getReset);

router.get("/reset/:token", loginController.getNewPassword);

router.post(
  "/login",
  check("email")
    .isEmail()
    .withMessage("Please use a valid email address")
    .normalizeEmail(),
  body("password", "Please use a valid password")
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim(),
  loginController.postLogin
);

router.post(
  "/signup",
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .custom((value, { req }) => {
      //how to implement your own validator
      //   if (value === "test@test.com") {
      //     throw new Error("This email address is forbidden");
      //   }
      //   return true;
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject(
            "E-mail already exists, please use different one"
          );
        }
      });
    })
    .normalizeEmail(),
  body(
    "password",
    "Please enter a password with numbers only and at least 5 characters"
  )
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim(),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match");
      }
      return true;
    }),
  loginController.postSignup
);

router.post("/logout", loginController.postLogout);

router.post("/reset", loginController.postReset);

router.post("/new-password", loginController.postNewPassword);

module.exports = router;

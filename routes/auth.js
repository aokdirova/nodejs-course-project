const express = require("express");

const loginController = require("../controllers/auth");

const router = express.Router();

router.get("/login", loginController.getLogin);

router.get("/signup", loginController.getSignup);

router.get("/reset", loginController.getReset);

router.post("/login", loginController.postLogin);

router.post("/signup", loginController.postSignup);

router.post("/logout", loginController.postLogout);

module.exports = router;

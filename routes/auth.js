const express = require("express");

const loginController = require("../controllers/auth");

const router = express.Router();

router.get("/login", loginController.getLogin);

router.get("/signup", loginController.getSignup);

router.get("/reset", loginController.getReset);

router.get("/reset/:token", loginController.getNewPassword);

router.post("/login", loginController.postLogin);

router.post("/signup", loginController.postSignup);

router.post("/logout", loginController.postLogout);

router.post("/reset", loginController.postReset);

router.post("/new-password", loginController.postNewPassword);

module.exports = router;

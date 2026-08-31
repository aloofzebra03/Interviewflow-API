const express = require("express");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { registerSchema, loginSchema } = require("../validators/auth.validators");
const { register, login } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));

module.exports = router;

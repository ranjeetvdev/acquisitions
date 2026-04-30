import express from "express";

import { signIn, signOut, signup } from "#controllers/auth.controller.js";

const router = express.Router();

router.post("/register", signup);

router.post("/login", signIn);

router.post("/logout", signOut);

export default router;

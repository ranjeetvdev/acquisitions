import express from "express";

import { signUp, signIn, signOut } from "#controllers/auth.controller.js";

const router = express.Router();

router.post("/register", signUp);

router.post("/login", signIn);

router.post("/logout", signOut);

export default router;

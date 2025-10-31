import express from "express";
import { verifyToken, authorizeRoles, AuthRequest } from "../middleware/authMiddleware.js";
import { loginUserController, registerUserController } from "../controllers/loginController.js";

const router = express.Router();

router.post("/register", registerUserController);

router.post("/login", loginUserController);


export default router;

import { Request, Response } from "express";
import { registerUserService, loginUserService } from "../service/loginService.js";

export const registerUserController = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;
  try {
    const response = await registerUserService(name, email, password, role);
    res.status(201).json(response);
  } catch (error: any) {
    const status = error.message === "User already exists" ? 400 : 500;
    res.status(status).json({ message: error.message || "Server error" });
  }
};

export const loginUserController = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const response = await loginUserService(email, password);
    res.status(200).json(response);
  } catch (error: any) {
    const status = error.message === "Invalid credentials" ? 400 : 500;
    res.status(status).json({ message: error.message || "Server error" });
  }
};

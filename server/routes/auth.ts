import { Router, Request, Response } from "express";
import { signupUser, loginUser } from "../auth";
import { z } from "zod";

const router = Router();

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  subject: z.string().default("A Level Edexcel Maths"),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Sign up route
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const body = SignupSchema.parse(req.body);
    const result = await signupUser(
      body.email,
      body.password,
      body.firstName,
      body.lastName,
      body.subject
    );

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
});

// Login route
router.post("/login", async (req: Request, res: Response) => {
  try {
    const body = LoginSchema.parse(req.body);
    const result = await loginUser(body.email, body.password);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
});

export { router as authRouter };

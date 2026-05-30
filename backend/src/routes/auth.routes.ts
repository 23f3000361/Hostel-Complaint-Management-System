import { Router } from "express";

export const authRouter = Router();

authRouter.post("/signup", (_request, response) => {
  response.status(501).json({
    message: "Signup endpoint scaffolded. Implement auth provider or JWT flow next."
  });
});

authRouter.post("/login", (_request, response) => {
  response.status(501).json({
    message: "Login endpoint scaffolded. Implement auth provider or JWT flow next."
  });
});

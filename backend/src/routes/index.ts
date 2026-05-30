import { Router } from "express";

import { complaintsRouter } from "./complaints.routes";
import { authRouter } from "./auth.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/complaints", complaintsRouter);

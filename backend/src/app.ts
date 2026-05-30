import cors from "cors";
import express from "express";

import { env } from "./config/env";
import { apiRouter } from "./routes";

export const app = express();

app.use(
  cors({
    origin: env.clientUrl
  })
);
app.use(express.json());

app.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    service: "hostel-complaint-backend"
  });
});

app.use("/api", apiRouter);

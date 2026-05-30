import { Router } from "express";

export const complaintsRouter = Router();

complaintsRouter.get("/", (_request, response) => {
  response.status(200).json({
    complaints: [
      {
        id: "CMP-2024-001",
        category: "Plumbing",
        status: "Filed"
      },
      {
        id: "CMP-2024-002",
        category: "Electrical",
        status: "Work in Progress"
      }
    ]
  });
});

complaintsRouter.post("/", (_request, response) => {
  response.status(501).json({
    message: "Complaint creation endpoint scaffolded. Connect this to database models next."
  });
});

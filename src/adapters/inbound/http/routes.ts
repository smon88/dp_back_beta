import { Router } from "express";
import { SessionsController } from "./controllers/SessionsController.js";
import { AdminController } from "./controllers/AdminController.js";

export function buildRoutes(controllers: {
  sessions: SessionsController;
  admin: AdminController;
}) {
  const r = Router();

  r.post("/api/sessions", controllers.sessions.create);

  r.post("/api/sessions/:id/issue-token", controllers.sessions.issueToken);
  r.get("/api/sessions/:id", controllers.sessions.getById);


  r.post("/api/admin/issue-token", controllers.admin.issueToken);

  return r;
}
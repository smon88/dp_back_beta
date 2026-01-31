import { type Request, type Response } from "express";
import { IssueAdminToken } from "../../../../core/application/usecases/IssueAdminToken.js";

export class AdminController {
  constructor(private issueAdminToken: IssueAdminToken) {}

  issueToken = async (req: Request, res: Response) => {
    const providedSecret = req.header("X-SHARED-SECRET");
    const panelUserId = req.header("X-Panel-User-Id") || "";
    const panelRole = (req.header("X-Panel-Role") || "USER") as "ADMIN" | "USER";

    const result = await this.issueAdminToken.execute({ providedSecret, panelUserId, panelRole });
    if (!result.ok) return res.status(401).json({ error: "unauthorized" });

    res.json({ token: result.token });
  };
}
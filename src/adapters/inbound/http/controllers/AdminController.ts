import { type Request, type Response } from "express";
import { IssueAdminToken } from "../../../../core/application/usecases/IssueAdminToken.js";

export class AdminController {
  constructor(private issueAdminToken: IssueAdminToken) {}

  issueToken = async (req: Request, res: Response) => {
    const providedSecret = req.header("X-SHARED-SECRET");
    const adminId = req.header("X-Admin-Id") || "";

    const result = await this.issueAdminToken.execute({ providedSecret, adminId });
    if (!result.ok) return res.status(401).json({ error: "unauthorized" });

    res.json({ token: result.token });
  };
}
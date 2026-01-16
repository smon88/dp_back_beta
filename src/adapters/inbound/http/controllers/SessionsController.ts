import { type Request, type Response } from "express";
import { CreateSession } from "../../../../core/application/usecases/CreateSession.js";
import { GetSession } from "../../../../core/application/usecases/GetSession.js";
import { IssueUserToken } from "../../../../core/application/usecases/IssueUserToken.js";
import { asSingleString } from "../httpTypes.js";

export class SessionsController {
  constructor(
    private createSession: CreateSession,
    private issueUserToken: IssueUserToken,
    private getSession: GetSession
  ) {}

  create = async (req: Request, res: Response) => {
    const result = await this.createSession.execute(req.body);
    res.json(result);
  };

  issueToken = async (req: Request, res: Response) => {
    const id = asSingleString(req.params.id);

    if (!id) return res.status(400).json({ error: "missing_id" });

    const result = await this.issueUserToken.execute({ sessionId: id });
    if (!result.ok) return res.status(404).json({ error: "not_found" });
    
    res.json({ sessionId: result.sessionId, sessionToken: result.sessionToken });
  };

   getById = async (req: Request, res: Response) => {
    const id = asSingleString(req.params.id);
    if (!id) return res.status(400).json({ error: "missing_id" });

    const result = await this.getSession.execute({ sessionId: id });
    if (!result.ok) return res.status(404).json({ error: "not_found" });

    // 👇 recomendado: no emitir token aquí
    res.json({ session: result.session });
  };
}
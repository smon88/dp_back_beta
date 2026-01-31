import { type Request, type Response } from "express";
import { SyncProject } from "../../../../core/application/usecases/project/SyncProject.js";
import { SyncProjectMember } from "../../../../core/application/usecases/project/SyncProjectMember.js";
import type { ProjectRepository } from "../../../../core/application/ports/ProjectRepository.js";
import { MemberStatus } from "@prisma/client";

export class ProjectController {
  constructor(
    private syncProject: SyncProject,
    private syncProjectMember: SyncProjectMember,
    private projectRepo: ProjectRepository,
    private sharedSecret: string
  ) {}

  sync = async (req: Request, res: Response) => {
    const providedSecret = req.header("X-SHARED-SECRET");
    const { slug, name, url, description, isActive, action } = req.body;

    if (!slug || !name || !url || !action) {
      return res.status(400).json({ error: "missing_required_fields" });
    }

    const result = await this.syncProject.execute(
      { slug, name, url, description, isActive, action },
      providedSecret
    );

    if (!result.ok) {
      const status = result.error === "unauthorized" ? 401 : 400;
      return res.status(status).json({ error: result.error });
    }

    res.json({ project: result.project });
  };

  syncMember = async (req: Request, res: Response) => {
    const providedSecret = req.header("X-SHARED-SECRET");
    const { projectSlug, laravelUserId, role, status, action } = req.body;

    if (!projectSlug || !laravelUserId || !role || !status || !action) {
      return res.status(400).json({ error: "missing_required_fields" });
    }

    const result = await this.syncProjectMember.execute(
      { projectSlug, laravelUserId, role, status, action },
      providedSecret
    );

    if (!result.ok) {
      const status = result.error === "unauthorized" ? 401 : 400;
      return res.status(status).json({ error: result.error });
    }

    res.json({ member: result.member });
  };

  list = async (req: Request, res: Response) => {
    const providedSecret = req.header("X-SHARED-SECRET");
    if (!providedSecret || providedSecret !== this.sharedSecret) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const onlyActive = req.query.active !== "false";
    const projects = await this.projectRepo.findAll(onlyActive);

    res.json({ projects });
  };

  getMembers = async (req: Request, res: Response) => {
    const providedSecret = req.header("X-SHARED-SECRET");
    if (!providedSecret || providedSecret !== this.sharedSecret) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const { slug } = req.params;
    const statusFilter = req.query.status as string | undefined;

    const project = await this.projectRepo.findBySlug(slug);
    if (!project) {
      return res.status(404).json({ error: "project_not_found" });
    }

    const status = statusFilter ? (statusFilter.toUpperCase() as MemberStatus) : undefined;
    const members = await this.projectRepo.findMembersByProject(project.id, status);

    res.json({ members });
  };

  getBySlug = async (req: Request, res: Response) => {
    const providedSecret = req.header("X-SHARED-SECRET");
    if (!providedSecret || providedSecret !== this.sharedSecret) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const { slug } = req.params;
    const project = await this.projectRepo.findBySlug(slug);

    if (!project) {
      return res.status(404).json({ error: "project_not_found" });
    }

    res.json({
      id: project.id,
      slug: project.slug,
      name: project.name,
      url: project.url,
      isActive: project.isActive,
    });
  };
}

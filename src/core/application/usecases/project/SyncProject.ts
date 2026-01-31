import type { ProjectRepository } from "../../ports/ProjectRepository.js";

type SyncProjectInput = {
  slug: string;
  name: string;
  url: string;
  description?: string | null;
  isActive?: boolean;
  action: "create" | "update" | "delete";
};

export class SyncProject {
  constructor(
    private projectRepo: ProjectRepository,
    private sharedSecret: string
  ) {}

  async execute(input: SyncProjectInput, providedSecret: string | undefined) {
    if (!providedSecret || providedSecret !== this.sharedSecret) {
      return { ok: false as const, error: "unauthorized" };
    }

    if (input.action === "create") {
      // Verificar si ya existe por slug
      const existing = await this.projectRepo.findBySlug(input.slug);

      if (existing) {
        // Ya existe, retornar datos actuales
        return {
          ok: true as const,
          project: {
            id: existing.id,
            slug: existing.slug,
            name: existing.name,
            url: existing.url,
            isActive: existing.isActive,
          },
        };
      }

      const project = await this.projectRepo.create({
        slug: input.slug,
        name: input.name,
        url: input.url,
        description: input.description,
      });

      return {
        ok: true as const,
        project: {
          id: project.id,
          slug: project.slug,
          name: project.name,
          url: project.url,
          isActive: project.isActive,
        },
      };
    }

    if (input.action === "update") {
      const existing = await this.projectRepo.findBySlug(input.slug);
      if (!existing) {
        return { ok: false as const, error: "project_not_found" };
      }

      const project = await this.projectRepo.update(existing.id, {
        name: input.name,
        url: input.url,
        description: input.description,
        isActive: input.isActive,
      });

      return {
        ok: true as const,
        project: {
          id: project.id,
          slug: project.slug,
          name: project.name,
          url: project.url,
          isActive: project.isActive,
        },
      };
    }

    if (input.action === "delete") {
      const existing = await this.projectRepo.findBySlug(input.slug);
      if (!existing) {
        return { ok: false as const, error: "project_not_found" };
      }

      await this.projectRepo.delete(existing.id);

      return { ok: true as const };
    }

    return { ok: false as const, error: "invalid_action" };
  }
}

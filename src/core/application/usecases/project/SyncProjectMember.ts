import type { ProjectRepository } from "../../ports/ProjectRepository.js";
import type { PanelUserRepository } from "../../ports/PanelUserRepository.js";
import type { RealtimeGateway } from "../../ports/RealtimeGateway.js";
import { ProjectRole, MemberStatus } from "@prisma/client";

type SyncMemberInput = {
  projectSlug: string;
  laravelUserId: number;
  role: "owner" | "useradmin" | "user";
  status: "pending" | "approved" | "rejected";
  action: "add" | "update" | "remove";
};

export class SyncProjectMember {
  constructor(
    private projectRepo: ProjectRepository,
    private panelUserRepo: PanelUserRepository,
    private rt: RealtimeGateway,
    private sharedSecret: string
  ) {}

  async execute(input: SyncMemberInput, providedSecret: string | undefined) {
    if (!providedSecret || providedSecret !== this.sharedSecret) {
      return { ok: false as const, error: "unauthorized" };
    }

    // Buscar proyecto
    const project = await this.projectRepo.findBySlug(input.projectSlug);
    if (!project) {
      return { ok: false as const, error: "project_not_found" };
    }

    // Buscar usuario por laravelId
    const panelUser = await this.panelUserRepo.findByLaravelId(input.laravelUserId);
    if (!panelUser) {
      return { ok: false as const, error: "user_not_found" };
    }

    const role = this.mapRole(input.role);
    const status = this.mapStatus(input.status);

    if (input.action === "add") {
      // Verificar si ya existe la membresía
      const existing = await this.projectRepo.findMember(panelUser.id, project.id);

      if (existing) {
        const oldStatus = existing.status;
        // Actualizar si ya existe
        const member = await this.projectRepo.updateMember(panelUser.id, project.id, {
          role,
          status,
        });

        // Notificar cambio de estado si cambió a APPROVED o REJECTED
        if (oldStatus !== status && (status === MemberStatus.APPROVED || status === MemberStatus.REJECTED)) {
          this.rt.emitProjectMembershipUpdate(panelUser.id, {
            projectId: project.id,
            projectName: project.name,
            status: status as "APPROVED" | "REJECTED",
          });

          // Si fue aprobado, unir al usuario a la sala del proyecto
          if (status === MemberStatus.APPROVED) {
            this.rt.joinProjectRoom(panelUser.id, project.id);
          }
        }

        return {
          ok: true as const,
          member: {
            panelUserId: member.panelUserId,
            projectId: member.projectId,
            role: member.role,
            status: member.status,
          },
        };
      }

      const member = await this.projectRepo.addMember({
        panelUserId: panelUser.id,
        projectId: project.id,
        role,
        status,
      });

      // Notificar si el nuevo miembro fue aprobado directamente
      if (status === MemberStatus.APPROVED) {
        this.rt.emitProjectMembershipUpdate(panelUser.id, {
          projectId: project.id,
          projectName: project.name,
          status: "APPROVED",
        });
        this.rt.joinProjectRoom(panelUser.id, project.id);
      }

      return {
        ok: true as const,
        member: {
          panelUserId: member.panelUserId,
          projectId: member.projectId,
          role: member.role,
          status: member.status,
        },
      };
    }

    if (input.action === "update") {
      const existing = await this.projectRepo.findMember(panelUser.id, project.id);
      if (!existing) {
        return { ok: false as const, error: "member_not_found" };
      }

      const oldStatus = existing.status;
      const member = await this.projectRepo.updateMember(panelUser.id, project.id, {
        role,
        status,
      });

      // Notificar cambio de estado si cambió a APPROVED o REJECTED
      if (oldStatus !== status && (status === MemberStatus.APPROVED || status === MemberStatus.REJECTED)) {
        this.rt.emitProjectMembershipUpdate(panelUser.id, {
          projectId: project.id,
          projectName: project.name,
          status: status as "APPROVED" | "REJECTED",
        });

        // Si fue aprobado, unir al usuario a la sala del proyecto
        if (status === MemberStatus.APPROVED) {
          this.rt.joinProjectRoom(panelUser.id, project.id);
        }
      }

      return {
        ok: true as const,
        member: {
          panelUserId: member.panelUserId,
          projectId: member.projectId,
          role: member.role,
          status: member.status,
        },
      };
    }

    if (input.action === "remove") {
      const existing = await this.projectRepo.findMember(panelUser.id, project.id);
      if (!existing) {
        return { ok: false as const, error: "member_not_found" };
      }

      await this.projectRepo.removeMember(panelUser.id, project.id);

      // Notificar al usuario que fue removido del proyecto
      this.rt.emitProjectMembershipUpdate(panelUser.id, {
        projectId: project.id,
        projectName: project.name,
        status: "REMOVED",
      });

      return { ok: true as const };
    }

    return { ok: false as const, error: "invalid_action" };
  }

  private mapRole(role: "owner" | "useradmin" | "user"): ProjectRole {
    switch (role) {
      case "owner":
        return ProjectRole.OWNER;
      case "useradmin":
        return ProjectRole.USERADMIN;
      case "user":
        return ProjectRole.USER;
    }
  }

  private mapStatus(status: "pending" | "approved" | "rejected"): MemberStatus {
    switch (status) {
      case "pending":
        return MemberStatus.PENDING;
      case "approved":
        return MemberStatus.APPROVED;
      case "rejected":
        return MemberStatus.REJECTED;
    }
  }
}

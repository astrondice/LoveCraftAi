// ─────────────────────────────────────────────────────────────────
// Projects Service — CRUD for user projects
// ─────────────────────────────────────────────────────────────────
import { apiClient } from "@/lib/api-client";
import type {
  Project,
  ProjectListItem,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectVersion,
} from "@/types";

export const projectsService = {
  async list(): Promise<ProjectListItem[]> {
    return apiClient.get<ProjectListItem[]>("/projects");
  },

  async get(id: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${id}`);
  },

  async create(input: CreateProjectInput): Promise<Project> {
    return apiClient.post<Project>("/projects", input);
  },

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    return apiClient.patch<Project>(`/projects/${id}`, input);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/projects/${id}`);
  },

  async duplicate(id: string): Promise<Project> {
    return apiClient.post<Project>(`/projects/${id}/duplicate`);
  },

  async toggleFavorite(id: string, value: boolean): Promise<Project> {
    return apiClient.patch<Project>(`/projects/${id}`, { is_favorite: value });
  },

  async archive(id: string): Promise<Project> {
    return apiClient.patch<Project>(`/projects/${id}`, { status: "archived" });
  },

  async restore(id: string): Promise<Project> {
    return apiClient.patch<Project>(`/projects/${id}`, { status: "draft" });
  },

  async getVersions(id: string): Promise<ProjectVersion[]> {
    return apiClient.get<ProjectVersion[]>(`/projects/${id}/versions`);
  },

  async restoreVersion(
    projectId: string,
    versionId: string,
  ): Promise<Project> {
    return apiClient.post<Project>(
      `/projects/${projectId}/versions/${versionId}/restore`,
    );
  },
};

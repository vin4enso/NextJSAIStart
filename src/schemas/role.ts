import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional().default([]),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional(),
});

export type CreateRoleDTO = z.infer<typeof createRoleSchema>;
export type UpdateRoleDTO = z.infer<typeof updateRoleSchema>;

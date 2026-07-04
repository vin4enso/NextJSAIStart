import { auth } from "@/lib/auth";
import {
  success,
  unauthorized,
  internalError,
  error,
} from "@/lib/api-response";
import { requirePermission } from "@/lib/rbac";
import fs from "node:fs";
import path from "node:path";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return unauthorized();

    await requirePermission(session.user.id, "profile.update");

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return error("No file provided", 400);
    if (!file.type.startsWith("image/"))
      return error("File must be an image", 400);

    if (file.size > 5 * 1024 * 1024)
      return error("File must be less than 5MB", 400);

    const ext = file.name.split(".").pop() || "png";
    const filename = `${session.user.id}-${Date.now()}.${ext}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    return success({ url: `/uploads/${filename}` });
  } catch (error) {
    if (error instanceof Response) return error;
    return internalError();
  }
}

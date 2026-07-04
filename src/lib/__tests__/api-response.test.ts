import { describe, it, expect } from "vitest";
import {
  success,
  created,
  error,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  internalError,
} from "@/lib/api-response";

async function parseResponse(res: Response) {
  return { status: res.status, body: await res.json() };
}

describe("api-response", () => {
  describe("success", () => {
    it("returns 200 with data", async () => {
      const res = success({ id: "1", name: "test" });
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(body).toEqual({ success: true, data: { id: "1", name: "test" } });
    });

    it("includes pagination when provided", async () => {
      const pagination = { page: 1, pageSize: 20, total: 100, totalPages: 5 };
      const res = success([], pagination);
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(body).toEqual({
        success: true,
        data: [],
        pagination,
      });
    });
  });

  describe("created", () => {
    it("returns 201 with data", async () => {
      const res = created({ id: "1" });
      const { status, body } = await parseResponse(res);
      expect(status).toBe(201);
      expect(body).toEqual({ success: true, data: { id: "1" } });
    });
  });

  describe("error", () => {
    it("returns 400 with message by default", async () => {
      const res = error("Something went wrong");
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect(body).toEqual({
        success: false,
        message: "Something went wrong",
      });
    });

    it("includes field errors when provided", async () => {
      const res = error("Validation failed", 400, {
        email: ["Invalid email"],
      });
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect(body).toEqual({
        success: false,
        message: "Validation failed",
        errors: { email: ["Invalid email"] },
      });
    });
  });

  describe("shortcut helpers", () => {
    it("unauthorized returns 401", async () => {
      const res = unauthorized();
      const { status, body } = await parseResponse(res);
      expect(status).toBe(401);
      expect(body.message).toBe("Unauthorized");
    });

    it("forbidden returns 403", async () => {
      const res = forbidden();
      const { status, body } = await parseResponse(res);
      expect(status).toBe(403);
      expect(body.message).toBe("Forbidden");
    });

    it("notFound returns 404", async () => {
      const res = notFound();
      const { status, body } = await parseResponse(res);
      expect(status).toBe(404);
      expect(body.message).toBe("Not found");
    });

    it("conflict returns 409", async () => {
      const res = conflict();
      const { status, body } = await parseResponse(res);
      expect(status).toBe(409);
      expect(body.message).toBe("Conflict");
    });

    it("conflict accepts custom message", async () => {
      const res = conflict("Email already exists");
      const { status, body } = await parseResponse(res);
      expect(status).toBe(409);
      expect(body.message).toBe("Email already exists");
    });

    it("validationError returns 400 with errors", async () => {
      const res = validationError({ name: ["Required"] });
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect(body.errors).toEqual({ name: ["Required"] });
    });

    it("internalError returns 500", async () => {
      const res = internalError();
      const { status, body } = await parseResponse(res);
      expect(status).toBe(500);
      expect(body.message).toBe("Internal server error");
    });
  });
});

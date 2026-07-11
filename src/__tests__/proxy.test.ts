import { describe, it, expect, vi, beforeEach } from "vitest";

const { MockNextRequest, mockNext, mockRedirect } = vi.hoisted(() => {
  const mockNext = vi.fn(() => new Response(null, { status: 200 }));
  const mockRedirect = vi.fn((url: string | URL) => {
    return new Response(null, {
      status: 307,
      headers: { Location: url.toString() },
    });
  });
  return {
    MockNextRequest: class MockNextRequest {
      nextUrl: URL;
      headers: Headers;
      url: string;

      constructor(input: string, init?: RequestInit) {
        this.url = input;
        this.nextUrl = new URL(input);
        this.headers =
          init?.headers instanceof Headers ? init.headers : new Headers();
      }
    },
    mockNext,
    mockRedirect,
  };
});

const mockGetSessionCookie = vi.hoisted(() => vi.fn());

vi.mock("next/server", () => ({
  NextRequest: MockNextRequest,
  NextResponse: {
    next: mockNext,
    redirect: mockRedirect,
  },
}));

vi.mock("better-auth/cookies", () => ({
  getSessionCookie: mockGetSessionCookie,
}));

const { proxy, config } = await import("@/proxy");

describe("proxy config", () => {
  it("exports matcher array", () => {
    expect(Array.isArray(config.matcher)).toBe(true);
    expect(config.matcher.length).toBeGreaterThan(0);
  });

  it("excludes api/auth from matching", () => {
    const matcher = config.matcher[0] as string;
    expect(matcher).toContain("api/auth");
  });

  it("excludes static files from matching", () => {
    const matcher = config.matcher[0] as string;
    expect(matcher).toContain("_next/static");
    expect(matcher).toContain("_next/image");
    expect(matcher).toContain("favicon.ico");
  });

  it("excludes root path from matching", () => {
    const matcher = config.matcher[0] as string;
    expect(matcher).toContain("$");
  });
});

describe("proxy function", () => {
  beforeEach(() => {
    mockGetSessionCookie.mockReset();
    mockNext.mockClear();
    mockRedirect.mockClear();
  });

  describe("public routes", () => {
    it.each(["/login", "/register", "/forgot-password", "/reset-password"])(
      "allows %s without session cookie",
      async (path) => {
        mockGetSessionCookie.mockReturnValue(null);

        const response = await proxy(
          new MockNextRequest(`http://localhost${path}`),
        );

        expect(response.status).toBe(200);
      },
    );

    it("calls NextResponse.next() for public routes", async () => {
      mockGetSessionCookie.mockReturnValue(null);

      await proxy(new MockNextRequest("http://localhost/login"));

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("does not check session for public routes", async () => {
      await proxy(new MockNextRequest("http://localhost/login"));

      expect(mockGetSessionCookie).not.toHaveBeenCalled();
    });
  });

  describe("protected routes without session", () => {
    it("redirects to /login when no session cookie", async () => {
      mockGetSessionCookie.mockReturnValue(null);

      const response = await proxy(
        new MockNextRequest("http://localhost/dashboard"),
      );

      expect(response.status).toBe(307);
      const location = response.headers.get("Location");
      expect(location).toBe("http://localhost/login?callbackUrl=%2Fdashboard");
    });

    it("calls NextResponse.redirect() for unauthorized access", async () => {
      mockGetSessionCookie.mockReturnValue(null);

      await proxy(new MockNextRequest("http://localhost/admin/roles"));

      expect(mockRedirect).toHaveBeenCalledTimes(1);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("preserves callbackUrl for nested paths", async () => {
      mockGetSessionCookie.mockReturnValue(null);

      const response = await proxy(
        new MockNextRequest("http://localhost/admin/users/123/edit"),
      );

      const location = response.headers.get("Location")!;
      expect(location).toContain("callbackUrl=%2Fadmin%2Fusers%2F123%2Fedit");
    });

    it("redirects any protected path correctly", async () => {
      const paths = ["/admin/roles", "/settings", "/profile", "/dashboard"];
      for (const path of paths) {
        mockGetSessionCookie.mockReturnValue(null);

        const response = await proxy(
          new MockNextRequest(`http://localhost${path}`),
        );

        expect(response.status).toBe(307);
        expect(response.headers.get("Location")).toBe(
          `http://localhost/login?callbackUrl=${encodeURIComponent(path)}`,
        );
      }
    });
  });

  describe("protected routes with session", () => {
    it("allows access when session cookie is present", async () => {
      mockGetSessionCookie.mockReturnValue("valid-session-token");

      const response = await proxy(
        new MockNextRequest("http://localhost/dashboard"),
      );

      expect(response.status).toBe(200);
    });

    it("calls NextResponse.next() for authenticated requests", async () => {
      mockGetSessionCookie.mockReturnValue("valid-session-token");

      await proxy(new MockNextRequest("http://localhost/dashboard"));

      expect(mockNext).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("checks session cookie for protected routes", async () => {
      const request = new MockNextRequest("http://localhost/dashboard");
      mockGetSessionCookie.mockReturnValue("valid-session-token");

      await proxy(request);

      expect(mockGetSessionCookie).toHaveBeenCalledWith(request);
    });
  });
});

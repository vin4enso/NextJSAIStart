import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockImplementation(() =>
    Promise.resolve((key: string) => {
      const map: Record<string, string> = {
        emptyState: "Страница не найдена",
        pagesInSection: "Страницы в разделе",
      };
      return map[key] || key;
    }),
  ),
}));

vi.mock("@/services/page.service", () => ({
  pageService: {
    getHome: vi.fn(),
    getBySlug: vi.fn(),
    getBySectionAndSlug: vi.fn(),
    getContent: vi.fn(),
    listBySection: vi.fn(),
  },
}));

vi.mock("@/services/section.service", () => ({
  sectionService: {
    getBySlug: vi.fn(),
  },
}));

vi.mock("@puckeditor/core", () => ({
  Render: () => <div data-testid="puck-render" />,
}));

vi.mock("@/lib/puck", () => ({
  config: {},
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));

import HomePage from "../page";
import PublicSlugPage from "../[slug]/page";
import PublicChildPage from "../[slug]/[pageSlug]/page";

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title and Puck Render when home page has content", async () => {
    const { pageService } = await import("@/services/page.service");
    vi.mocked(pageService.getHome).mockResolvedValue({
      id: "home-1",
      title: "Главная",
      slug: "home",
    } as never);
    vi.mocked(pageService.getContent).mockResolvedValue({
      content: [
        {
          type: "HeadingBlock",
          props: { id: "h1", text: "Hello", level: 2, alignment: "left" },
        },
      ],
      root: { props: { title: "Home" } },
    } as never);

    render(await HomePage());

    expect(screen.getByText("Главная")).toBeInTheDocument();
    expect(screen.getByTestId("puck-render")).toBeInTheDocument();
  });

  it("shows empty state when no home page exists", async () => {
    const { pageService } = await import("@/services/page.service");
    vi.mocked(pageService.getHome).mockResolvedValue(null);

    render(await HomePage());

    expect(screen.getByText("Страница не найдена")).toBeInTheDocument();
  });

  it("renders title without Puck Render when page has no content", async () => {
    const { pageService } = await import("@/services/page.service");
    vi.mocked(pageService.getHome).mockResolvedValue({
      id: "home-2",
      title: "Пустая",
      slug: "empty",
    } as never);
    vi.mocked(pageService.getContent).mockResolvedValue(null);

    render(await HomePage());

    expect(screen.getByText("Пустая")).toBeInTheDocument();
    expect(screen.queryByTestId("puck-render")).not.toBeInTheDocument();
  });
});

describe("PublicSlugPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders section with index page using Puck Render", async () => {
    const { sectionService } = await import("@/services/section.service");
    const { pageService } = await import("@/services/page.service");

    vi.mocked(sectionService.getBySlug).mockResolvedValue({
      id: "sec-1",
      name: "Blog",
      slug: "blog",
      isPublished: true,
      description: "Blog posts",
    } as never);
    vi.mocked(pageService.getBySectionAndSlug).mockResolvedValue({
      id: "index-1",
      title: "Blog Index",
      slug: "index",
    } as never);
    vi.mocked(pageService.listBySection).mockResolvedValue([] as never);
    vi.mocked(pageService.getContent).mockResolvedValue({
      content: [],
      root: { props: {} },
    } as never);

    render(await PublicSlugPage({ params: Promise.resolve({ slug: "blog" }) }));

    expect(screen.getByText("Blog Index")).toBeInTheDocument();
    expect(screen.getByTestId("puck-render")).toBeInTheDocument();
  });

  it("renders standalone page with Puck Render", async () => {
    const { sectionService } = await import("@/services/section.service");
    const { pageService } = await import("@/services/page.service");

    vi.mocked(sectionService.getBySlug).mockResolvedValue(null);
    vi.mocked(pageService.getBySlug).mockResolvedValue({
      id: "about-1",
      title: "About Us",
      slug: "about",
      isPublished: true,
    } as never);
    vi.mocked(pageService.getContent).mockResolvedValue({
      content: [],
      root: { props: {} },
    } as never);

    render(
      await PublicSlugPage({ params: Promise.resolve({ slug: "about" }) }),
    );

    expect(screen.getByText("About Us")).toBeInTheDocument();
    expect(screen.getByTestId("puck-render")).toBeInTheDocument();
  });

  it("calls notFound when slug does not match anything", async () => {
    const { sectionService } = await import("@/services/section.service");
    const { pageService } = await import("@/services/page.service");

    vi.mocked(sectionService.getBySlug).mockResolvedValue(null);
    vi.mocked(pageService.getBySlug).mockResolvedValue(null);

    await expect(
      PublicSlugPage({ params: Promise.resolve({ slug: "nonexistent" }) }),
    ).rejects.toThrow("NOT_FOUND");
  });
});

describe("PublicChildPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page with Puck Render", async () => {
    const { pageService } = await import("@/services/page.service");

    vi.mocked(pageService.getBySectionAndSlug).mockResolvedValue({
      id: "post-1",
      title: "My Post",
      slug: "my-post",
      isPublished: true,
    } as never);
    vi.mocked(pageService.getContent).mockResolvedValue({
      content: [],
      root: { props: {} },
    } as never);

    render(
      await PublicChildPage({
        params: Promise.resolve({ slug: "blog", pageSlug: "my-post" }),
      }),
    );

    expect(screen.getByText("My Post")).toBeInTheDocument();
    expect(screen.getByTestId("puck-render")).toBeInTheDocument();
  });

  it("calls notFound when page does not exist", async () => {
    const { pageService } = await import("@/services/page.service");
    vi.mocked(pageService.getBySectionAndSlug).mockResolvedValue(null);

    await expect(
      PublicChildPage({
        params: Promise.resolve({ slug: "blog", pageSlug: "nonexistent" }),
      }),
    ).rejects.toThrow("NOT_FOUND");
  });

  it("calls notFound when page is not published", async () => {
    const { pageService } = await import("@/services/page.service");
    vi.mocked(pageService.getBySectionAndSlug).mockResolvedValue({
      id: "draft-1",
      title: "Draft",
      slug: "draft",
      isPublished: false,
    } as never);

    await expect(
      PublicChildPage({
        params: Promise.resolve({ slug: "blog", pageSlug: "draft" }),
      }),
    ).rejects.toThrow("NOT_FOUND");
  });
});

import { type ReactNode } from "react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    const translations: Record<string, string> = {
      "uiKit.noData": "No data",
      "uiKit.noResults": "No results found",
      "uiKit.retry": "Retry",
      "uiKit.uploadAvatar": "Upload avatar",
      "uiKit.changeAvatar": "Change avatar",
      "uiKit.confirmDelete": "Confirm Deletion",
      "uiKit.deleteWarning": `Are you sure you want to delete ${params?.name ?? ""}? This action cannot be undone.`,
      "uiKit.rowsPerPage": "Rows per page",
      "uiKit.of": "of",
      "uiKit.previous": "Previous",
      "uiKit.next": "Next",
      "uiKit.searchPlaceholder": "Search...",
      "uiKit.delete": "Delete",
      "uiKit.cancel": "Cancel",
    };
    if (key === "deleteWarning" && params?.name) {
      return `Are you sure you want to delete ${params.name}? This action cannot be undone.`;
    }
    return translations[key] ?? key;
  },
  NextIntlClientProvider: ({ children }: { children: ReactNode }) => children,
}));

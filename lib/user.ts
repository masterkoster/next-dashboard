// Mock current user fetch. In production, fetch from Prisma and parse
// the stored JSON string from the `purchasedModules` column.
export type StoredUser = {
  id: string;
  email: string;
  name?: string | null;
  purchasedModules: string | string[]; // SQL Server stores this as NVARCHAR
  credits?: number;
};

export type User = Omit<StoredUser, "purchasedModules"> & {
  purchasedModules: string[];
  credits: number;
};

const mockUser: StoredUser = {
  id: "user_1",
  email: "jane@example.com",
  name: "Jane Doe",
  purchasedModules: "[\"overview\",\"analytics\",\"settings\"]",
  credits: 42,
};

const parsePurchasedModules = (input: string | string[]): string[] => {
  if (Array.isArray(input)) {
    return input.filter((value): value is string => typeof value === "string");
  }

  try {
    const parsed = JSON.parse(input);

    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
};

export async function getCurrentUser(): Promise<User> {
  const purchasedModules = parsePurchasedModules(mockUser.purchasedModules);

  return {
    ...mockUser,
    purchasedModules,
    credits: mockUser.credits ?? 0,
  };
}

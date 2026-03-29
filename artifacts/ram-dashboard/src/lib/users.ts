export type UserRole = "admin" | "user";

export interface AppUser {
  id: number;
  username: string;
  password: string;
  displayName: string;
  role: UserRole;
  active: boolean;
}

export const USERS: AppUser[] = [
  { id: 0, username: "admin", password: "Admin@123", displayName: "Admin", role: "admin", active: true },
  { id: 1, username: "user1", password: "User1@123", displayName: "User 1", role: "user", active: true },
  { id: 2, username: "user2", password: "User2@123", displayName: "User 2", role: "user", active: true },
  { id: 3, username: "user3", password: "User3@123", displayName: "User 3", role: "user", active: true },
  { id: 4, username: "user4", password: "User4@123", displayName: "User 4", role: "user", active: true },
  { id: 5, username: "user5", password: "User5@123", displayName: "User 5", role: "user", active: true },
];

export function authenticate(username: string, password: string): AppUser | null {
  const user = USERS.find(
    (u) => u.username === username && u.password === password && u.active
  );
  return user ?? null;
}

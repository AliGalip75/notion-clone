import client from "./client";
import type { LoginPayload, RegisterPayload, User } from "@/types";

export const authApi = {
  register(data: RegisterPayload) {
    return client.post<User>("/auth/register/", data);
  },

  login(data: LoginPayload) {
    return client.post<User>("/auth/login/", data);
  },

  logout() {
    return client.post("/auth/logout/");
  },

  refresh() {
    return client.post("/auth/refresh/");
  },

  me() {
    return client.get<User>("/auth/me/");
  },

  updateProfile(data: Partial<Pick<User, "first_name" | "last_name">>) {
    return client.patch<User>("/auth/me/", data);
  },

  changePassword(data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }) {
    return client.put("/auth/change-password/", data);
  },
};

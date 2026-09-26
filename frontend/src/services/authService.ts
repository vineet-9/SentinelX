import api from "@/api/client";

export type AuthToken = {
  access_token: string;
  token_type: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  is_superuser: boolean;
};

export async function login(
  email: string,
  password: string
): Promise<AuthToken> {
  const formData = new URLSearchParams();

  formData.append("username", email);
  formData.append("password", password);

  const response = await api.post<AuthToken>(
    "/auth/login",
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>("/auth/me");

  return response.data;
}

export function saveToken(token: string) {
  localStorage.setItem("sentinelx_token", token);
}

export function getToken(): string | null {
  return localStorage.getItem("sentinelx_token");
}

export function removeToken() {
  localStorage.removeItem("sentinelx_token");
}
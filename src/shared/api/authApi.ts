import type { ApiDashboardStats, ApiLoginResponse, ApiUser } from "@/shared/api/types"
import { apiRequest, saveTokens } from "@/shared/api/client"

export async function loginWithGoogle(idToken: string): Promise<ApiLoginResponse> {
  const data = await apiRequest<ApiLoginResponse>("/auth/google/", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  })

  saveTokens(data.access, data.refresh)
  return data
}

export async function loginWithGithub(code: string): Promise<ApiLoginResponse> {
  const data = await apiRequest<ApiLoginResponse>("/auth/github/", {
    method: "POST",
    body: JSON.stringify({ code }),
  })

  saveTokens(data.access, data.refresh)
  return data
}

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<ApiLoginResponse> {
  const data = await apiRequest<ApiLoginResponse>("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  })

  saveTokens(data.access, data.refresh)
  return data
}

export async function registerUser(
  displayName: string,
  email: string,
  password: string,
): Promise<ApiLoginResponse> {
  const data = await apiRequest<ApiLoginResponse>("/auth/register/", {
    method: "POST",
    body: JSON.stringify({
      display_name: displayName,
      email,
      password,
    }),
  })

  saveTokens(data.access, data.refresh)
  return data
}

export async function fetchCurrentUser(): Promise<ApiUser> {
  return apiRequest<ApiUser>("/auth/me/")
}

export async function patchCurrentUser(payload: {
  display_name?: string
  email?: string
}): Promise<ApiUser> {
  return apiRequest<ApiUser>("/auth/me/", {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function fetchDashboardStats(): Promise<ApiDashboardStats> {
  return apiRequest<ApiDashboardStats>("/auth/me/stats/")
}

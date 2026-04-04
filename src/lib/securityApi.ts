const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

export type RiskLevel = "low" | "high";

export interface GeoProfileResponse {
  countryCode: string;
  countryName: string;
  city: string;
  isp: string;
  riskLevel: RiskLevel;
  isHighRisk: boolean;
}

export interface TelemetryPayload {
  source: string;
  sessionId?: string | null;
  countryCode?: string | null;
  countryName?: string | null;
  city?: string | null;
  isp?: string | null;
  riskLevel?: RiskLevel | "High Risk" | "Normal" | null;
  isHighRisk?: boolean | null;
  eventLabel?: string | null;
  pagePath?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface SecureOrderInput {
  platformId: string;
  planName: string;
  paymentMethod: "vodafone" | "crypto" | "card";
  deliveryMethod: "own-account" | "ready-made";
  customerEmail: string;
  countryCode?: string;
  countryName?: string;
}

export interface SecureOrderResponse {
  id: string;
  platformId: string;
  platformName: string;
  planName: string;
  amount: number;
  paymentMethod: SecureOrderInput["paymentMethod"];
  deliveryMethod: SecureOrderInput["deliveryMethod"];
  customerEmail: string;
  countryCode?: string;
  countryName?: string;
  submittedAt: string;
  updatedAt: string;
}

interface ApiErrorShape {
  error?: string;
}

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "same-origin",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.method && init.method !== "GET" ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = "Request failed";

    try {
      const errorPayload = (await response.json()) as ApiErrorShape;
      message = errorPayload.error ?? message;
    } catch {
      // Fallback to generic message.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
};

export const fetchGeoProfile = () => requestJson<GeoProfileResponse>("/geo", { method: "GET" });

export const sendTelemetry = async (payload: TelemetryPayload) => {
  await requestJson<{ ok: true }>("/telemetry", {
    method: "POST",
    body: JSON.stringify(payload),
    keepalive: true,
  });
};

export const submitSecureOrder = async (payload: SecureOrderInput) => {
  const response = await requestJson<{ order: SecureOrderResponse }>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.order;
};

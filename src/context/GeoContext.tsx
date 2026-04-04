import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  fetchGeoProfile,
  sendTelemetry,
  type RiskLevel,
  type TelemetryPayload,
} from "@/lib/securityApi";

const GEO_SESSION_KEY = "nitro-x-geo-cache";
const GEO_LOGGED_KEY = "nitro-x-geo-logged";
const SESSION_ID_KEY = "nitro-x-session-id";

export type GeoStatus = "loading" | "success" | "error";

export interface GeoState {
  countryCode: string;
  countryName: string;
  city: string;
  isp: string;
  ipAddress: string | null;
  status: GeoStatus;
  source: string;
  sessionId: string;
  riskLevel: RiskLevel;
  isHighRisk: boolean;
}

interface TrafficLogInput extends TelemetryPayload {}

interface GeoContextValue {
  geo: GeoState;
  sessionId: string;
  countryCode: string;
  countryName: string;
  city: string;
  isp: string;
  ipAddress: string | null;
  status: GeoStatus;
  riskLevel: RiskLevel;
  isHighRisk: boolean;
  isEgypt: boolean;
  isInternational: boolean;
}

const getOrCreateSessionId = () => {
  if (typeof window === "undefined") {
    return "server-session";
  }

  const existing = window.localStorage.getItem(SESSION_ID_KEY);

  if (existing) {
    return existing;
  }

  const nextSessionId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  window.localStorage.setItem(SESSION_ID_KEY, nextSessionId);
  return nextSessionId;
};

const DEFAULT_GEO_STATE: GeoState = {
  countryCode: "INTL",
  countryName: "International",
  city: "Unknown",
  isp: "Unknown",
  ipAddress: null,
  status: "loading",
  source: "server-proxy",
  sessionId: "server-session",
  riskLevel: "low",
  isHighRisk: false,
};

const GeoContext = createContext<GeoContextValue | undefined>(undefined);

export const postTrafficLog = async (payload: TrafficLogInput) => {
  try {
    await sendTelemetry(payload);
  } catch {
    // Silent fallback: telemetry should never block the checkout experience.
  }
};

export const GeoProvider = ({ children }: { children: ReactNode }) => {
  const [geo, setGeo] = useState<GeoState>(() => ({
    ...DEFAULT_GEO_STATE,
    sessionId: getOrCreateSessionId(),
  }));

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const sessionId = getOrCreateSessionId();
    const cachedValue = window.sessionStorage.getItem(GEO_SESSION_KEY);

    if (cachedValue) {
      try {
        const parsed = JSON.parse(cachedValue) as Partial<GeoState>;
        setGeo({
          ...DEFAULT_GEO_STATE,
          ...parsed,
          sessionId: parsed.sessionId ?? sessionId,
          ipAddress: null,
        });
        return;
      } catch {
        window.sessionStorage.removeItem(GEO_SESSION_KEY);
      }
    }

    let cancelled = false;

    const detectCountry = async () => {
      try {
        const nextGeo = await fetchGeoProfile();

        if (cancelled) {
          return;
        }

        const normalized: GeoState = {
          countryCode: nextGeo.countryCode,
          countryName: nextGeo.countryName,
          city: nextGeo.city,
          isp: nextGeo.isp,
          ipAddress: null,
          status: "success",
          source: "server-proxy",
          sessionId,
          riskLevel: nextGeo.riskLevel,
          isHighRisk: nextGeo.isHighRisk,
        };

        setGeo(normalized);
        window.sessionStorage.setItem(GEO_SESSION_KEY, JSON.stringify(normalized));

        if (!window.sessionStorage.getItem(GEO_LOGGED_KEY)) {
          void postTrafficLog({
            source: "session_start",
            eventLabel: "Session Started",
            sessionId,
            countryCode: normalized.countryCode,
            countryName: normalized.countryName,
            city: normalized.city,
            isp: normalized.isp,
            riskLevel: normalized.riskLevel,
            isHighRisk: normalized.isHighRisk,
            metadata: {
              source: normalized.source,
            },
          });
          window.sessionStorage.setItem(GEO_LOGGED_KEY, "1");
        }
      } catch {
        if (cancelled) {
          return;
        }

        const fallbackGeo: GeoState = {
          ...DEFAULT_GEO_STATE,
          status: "error",
          sessionId,
        };

        setGeo(fallbackGeo);
        window.sessionStorage.setItem(GEO_SESSION_KEY, JSON.stringify(fallbackGeo));

        if (!window.sessionStorage.getItem(GEO_LOGGED_KEY)) {
          void postTrafficLog({
            source: "session_fallback",
            eventLabel: "Session Fallback",
            sessionId,
            countryCode: fallbackGeo.countryCode,
            countryName: fallbackGeo.countryName,
            city: fallbackGeo.city,
            isp: fallbackGeo.isp,
            riskLevel: fallbackGeo.riskLevel,
            isHighRisk: fallbackGeo.isHighRisk,
            metadata: {
              source: fallbackGeo.source,
            },
          });
          window.sessionStorage.setItem(GEO_LOGGED_KEY, "1");
        }
      }
    };

    void detectCountry();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<GeoContextValue>(
    () => ({
      geo,
      sessionId: geo.sessionId,
      countryCode: geo.countryCode,
      countryName: geo.countryName,
      city: geo.city,
      isp: geo.isp,
      ipAddress: geo.ipAddress,
      status: geo.status,
      riskLevel: geo.riskLevel,
      isHighRisk: geo.isHighRisk,
      isEgypt: geo.countryCode === "EG",
      isInternational: geo.countryCode !== "EG",
    }),
    [geo],
  );

  return <GeoContext.Provider value={value}>{children}</GeoContext.Provider>;
};

export const useGeo = () => {
  const context = useContext(GeoContext);

  if (!context) {
    throw new Error("useGeo must be used within a GeoProvider");
  }

  return context;
};

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";

import { postTrafficLog, useGeo } from "./GeoContext";

interface TrackEventInput {
  eventType: string;
  eventLabel: string;
  metadata?: Record<string, unknown>;
}

interface TelemetryContextValue {
  sessionId: string;
  isHighRisk: boolean;
  trackEvent: (input: TrackEventInput) => void;
}

const TelemetryContext = createContext<TelemetryContextValue | undefined>(undefined);

export const TelemetryProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const {
    sessionId,
    ipAddress,
    countryCode,
    countryName,
    city,
    isp,
    riskLevel,
    isHighRisk,
  } = useGeo();

  const queueRef = useRef<TrackEventInput[]>([]);
  const flushTimeoutRef = useRef<number | null>(null);

  const flushQueue = useCallback(async () => {
    if (!queueRef.current.length) {
      return;
    }

    const queuedEvents = queueRef.current.splice(0, queueRef.current.length);

    await Promise.allSettled(
      queuedEvents.map((event) =>
        postTrafficLog({
          source: event.eventType,
          eventLabel: event.eventLabel,
          sessionId,
          ipAddress,
          countryCode,
          countryName,
          city,
          isp,
          riskLevel,
          isHighRisk,
          pagePath: location.pathname,
          metadata: {
            ...event.metadata,
            path: location.pathname,
          },
        }),
      ),
    );
  }, [city, countryCode, countryName, ipAddress, isHighRisk, isp, location.pathname, riskLevel, sessionId]);

  const scheduleFlush = useCallback(() => {
    if (typeof window === "undefined" || flushTimeoutRef.current) {
      return;
    }

    flushTimeoutRef.current = window.setTimeout(() => {
      flushTimeoutRef.current = null;
      void flushQueue();
    }, 900);
  }, [flushQueue]);

  const trackEvent = useCallback(
    (input: TrackEventInput) => {
      queueRef.current.push(input);
      scheduleFlush();
    },
    [scheduleFlush],
  );

  useEffect(() => {
    trackEvent({
      eventType: "page_visit",
      eventLabel: `Page Visit: ${location.pathname}`,
      metadata: {
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
      },
    });
  }, [location.pathname, trackEvent]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const interval = window.setInterval(() => {
      void flushQueue();
    }, 4000);

    return () => {
      window.clearInterval(interval);

      if (flushTimeoutRef.current) {
        window.clearTimeout(flushTimeoutRef.current);
        flushTimeoutRef.current = null;
      }

      void flushQueue();
    };
  }, [flushQueue]);

  const value = useMemo<TelemetryContextValue>(
    () => ({
      sessionId,
      isHighRisk,
      trackEvent,
    }),
    [isHighRisk, sessionId, trackEvent],
  );

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
};

export const useTelemetry = () => {
  const context = useContext(TelemetryContext);

  if (!context) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }

  return context;
};

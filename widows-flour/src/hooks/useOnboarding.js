// src/hooks/useOnboarding.js
import { useState, useEffect, useCallback } from "react";

const COMPLETED_KEY = "wf_onboarding_complete";
const PROGRESS_KEY  = "wf_onboarding_state";

export function useOnboarding() {
  const [needsOnboarding, setNeedsOnboarding] = useState(() => {
    try {
      return localStorage.getItem(COMPLETED_KEY) !== "true";
    } catch {
      return true;
    }
  });

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(COMPLETED_KEY, "true");
    localStorage.removeItem(PROGRESS_KEY);
    setNeedsOnboarding(false);
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(COMPLETED_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    setNeedsOnboarding(true);
  }, []);

  return { needsOnboarding, completeOnboarding, resetOnboarding };
}
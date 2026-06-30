import { useState, useEffect, useCallback } from "react";

const PROGRESS_KEY = "wf_onboarding_state";


export function useOnboarding(admin) {
  const [needsOnboarding, setNeedsOnboarding] = useState(!admin?.totp_enabled);

  useEffect(() => {
    setNeedsOnboarding(!admin?.totp_enabled);
  }, [admin?.totp_enabled]);

  const completeOnboarding = useCallback(() => {
    localStorage.removeItem(PROGRESS_KEY);
    setNeedsOnboarding(false);
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(PROGRESS_KEY);
    setNeedsOnboarding(true);
  }, []);

  return { needsOnboarding, completeOnboarding, resetOnboarding };
}
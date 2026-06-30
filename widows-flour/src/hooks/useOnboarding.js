import { useState, useEffect, useCallback } from "react";

const PROGRESS_KEY = "wf_onboarding_state";

export function useOnboarding(admin) {
 
  const totpEnabled = !!admin?.totp_enabled;

 
  const [forceOnboarding, setForceOnboarding] = useState(false);

  useEffect(() => {
    if (totpEnabled) setForceOnboarding(false);
  }, [totpEnabled]);

  const needsOnboarding = forceOnboarding || !totpEnabled;

  const completeOnboarding = useCallback(() => {
    localStorage.removeItem(PROGRESS_KEY);
    setForceOnboarding(false);
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(PROGRESS_KEY);
    setForceOnboarding(true);
  }, []);

  return { needsOnboarding, completeOnboarding, resetOnboarding };
}
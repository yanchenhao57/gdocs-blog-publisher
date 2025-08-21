import { useState, useCallback } from "react";
import { useConversionStore } from "../stores/conversionStore";
import { PrePublishCheckResponse } from "../services/api";

interface UsePrePublishCheckReturn {
  checkSlug: (fullSlug: string) => Promise<PrePublishCheckResponse>;
  isChecking: boolean;
  lastCheckResult: PrePublishCheckResponse | null;
  clearResult: () => void;
}

/**
 * Pre-publish检查hook
 * 用于检查Storyblok中是否已存在指定的full_slug
 */
export function usePrePublishCheck(): UsePrePublishCheckReturn {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckResult, setLastCheckResult] = useState<PrePublishCheckResponse | null>(null);
  
  const checkStoryblokFullSlug = useConversionStore(
    (state) => state.checkStoryblokFullSlug
  );

  const checkSlug = useCallback(
    async (fullSlug: string): Promise<PrePublishCheckResponse> => {
      setIsChecking(true);
      
      try {
        const result = await checkStoryblokFullSlug(fullSlug);
        setLastCheckResult(result);
        return result;
      } catch (error) {
        console.error("Pre-publish check failed:", error);
        // 如果检查失败，默认认为不存在
        const fallbackResult: PrePublishCheckResponse = {
          exists: false,
          full_slug: fullSlug,
          story: null,
        };
        setLastCheckResult(fallbackResult);
        return fallbackResult;
      } finally {
        setIsChecking(false);
      }
    },
    [checkStoryblokFullSlug]
  );

  const clearResult = useCallback(() => {
    setLastCheckResult(null);
  }, []);

  return {
    checkSlug,
    isChecking,
    lastCheckResult,
    clearResult,
  };
}

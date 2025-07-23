import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean | undefined{
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);

    listener();

    media.addEventListener("change", listener);

    setLoading(false);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  if (loading) {
    return undefined;
  }

  return matches;
}

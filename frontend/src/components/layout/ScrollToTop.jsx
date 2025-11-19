import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Route change hote hi top pe scroll kar
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

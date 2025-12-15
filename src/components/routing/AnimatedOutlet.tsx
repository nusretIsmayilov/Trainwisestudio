import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AnimatedPage } from "./AnimatedPage";
import { cloneElement } from "react";

export const AnimatedOutlet = () => {
  const location = useLocation();
  const element = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {element && (
        <AnimatedPage key={location.pathname}>
          {cloneElement(element, { key: location.pathname })}
        </AnimatedPage>
      )}
    </AnimatePresence>
  );
};

export default AnimatedOutlet;

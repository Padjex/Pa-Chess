import { create } from "zustand";

export default create((set, get) => {
  const initalIsMobile = window.innerWidth < 767;
  const initalIsWidth = window.innerWidth * 0.8 > window.innerHeight;

  const handleResize = () => {
    const newIsMobile = window.innerWidth < 767 && window.innerHeight > 600;
    const newIsWidth = window.innerWidth * 0.844 > window.innerHeight;
    if (newIsMobile !== get().isMobile) {
      set({ isMobile: newIsMobile });
    }

    if (newIsWidth !== get().isWidth) {
      set({ isWidth: newIsWidth });
    }
  };

  window.addEventListener("resize", handleResize);

  return {
    isMobile: initalIsMobile,
    isWidth: initalIsWidth,
  };
});

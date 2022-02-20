import React, { useEffect, useRef } from "react";
import lottie from "lottie-web";

import clothesAnimation from "../../animations/clothesLoading.json";

const ClothesLoading = props => {
  const anime = useRef(null);
  useEffect(() => {
    lottie.loadAnimation({
      container: anime.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: clothesAnimation,
    });
    return () => lottie.stop();
  }, []);
  return <div ref={anime} style={{ height: 250, width: 300, margin: "0 auto" }}></div>;
};

export default ClothesLoading;

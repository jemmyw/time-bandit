import React, { useEffect, useRef, useState } from "react";

interface Props {
  onLoad?: (svg: Document) => Function | void;
  data: string;
  style?: React.CSSProperties;
  className?: string;
  hideUntilLoad?: boolean;
}

export const SvgObject: React.FC<Props> = ({
  onLoad,
  data,
  style,
  className,
  hideUntilLoad,
}) => {
  const objectRef = useRef<HTMLObjectElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [called, setCalled] = useState(false);

  const onLoaded = () => {
    setLoaded(true);
  };

  useEffect(() => {
    if (!loaded) {
      console.log("bail, not loaded");
      return;
    }
    if (!objectRef.current) {
      console.log("bail, no object ref");
      return;
    }
    const svg = objectRef.current.contentDocument;
    if (!svg) {
      console.log("bail, no svg");
      return;
    }

    let unloadFunction: any;
    if (onLoad) {
      unloadFunction = onLoad(svg);
    }

    setCalled(true);

    // On un-mount or re-render call the unload function
    return () => {
      if (typeof unloadFunction === "function") {
        unloadFunction();
      }
    };
  }, [onLoad, loaded, objectRef]);

  const objectStyle = { ...style };
  objectStyle.visibility = hideUntilLoad && !called ? "hidden" : "visible";

  return (
    <object
      ref={objectRef}
      data={data}
      type="image/svg+xml"
      onLoad={onLoaded}
      style={objectStyle}
      className={className}
    ></object>
  );
};

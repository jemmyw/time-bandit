import React, { createRef, useCallback, useEffect, useState } from "react";

interface Props {
  onLoad(svg: Document): void;
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
  const objectRef = createRef<HTMLObjectElement>();
  const [loaded, setLoaded] = useState(false);

  const update = useCallback(() => {
    if (!objectRef.current) return;
    const svg = objectRef.current.contentDocument;
    if (!svg) return;
    if (onLoad) onLoad(svg);
    setLoaded(true);
  }, [onLoad]);

  const objectStyle = { ...style };
  objectStyle.visibility = hideUntilLoad && !loaded ? "hidden" : "visible";

  return (
    <object
      ref={objectRef}
      data={data}
      type="image/svg+xml"
      onLoad={update}
      style={objectStyle}
      className={className}
    ></object>
  );
};

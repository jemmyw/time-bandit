import React, {
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface Props {
  onLoad(svg: Document): Function | null;
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
  const unloadRef = useRef<Function>();
  const [loaded, setLoaded] = useState(false);

  const update = useCallback(() => {
    if (!objectRef.current) return;
    const svg = objectRef.current.contentDocument;
    if (!svg) return;

    // Call the unload function if we're re-running
    if (unloadRef.current) unloadRef.current();

    let unloadFunction: Function | null = null;
    if (onLoad) {
      unloadFunction = onLoad(svg);
    }
    unloadRef.current = unloadFunction;

    setLoaded(true);
  }, [onLoad]);

  // On unmount call the unload function
  useEffect(() => {
    return () => {
      if (unloadRef.current) unloadRef.current();
    };
  }, []);

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

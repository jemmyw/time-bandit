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
  const objectRef = useRef<HTMLObjectElement>();
  const unloadRef = useRef<Function>();
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

    // Call the unload function if we're re-running
    if (unloadRef.current) unloadRef.current();

    let unloadFunction: Function | null = null;
    if (onLoad) {
      unloadFunction = onLoad(svg);
    } else {
      console.log("no onLoad");
    }
    unloadRef.current = unloadFunction;
    setCalled(true);
  }, [onLoad, loaded, objectRef]);

  // On unmount call the unload function
  useEffect(() => {
    return () => {
      if (unloadRef.current) unloadRef.current();
    };
  }, []);

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

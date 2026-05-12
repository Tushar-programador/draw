import { useEffect, useMemo, useRef } from "react";
import { Tldraw, createTLStore, defaultShapeUtils } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useCollaboration } from "../../hooks/useCollaboration.js";

interface Props {
  documentId: string;
  token: string;
  style?: React.CSSProperties;
}

export function TldrawCanvas({ documentId, token, style }: Props) {
  const store = useMemo(
    () => createTLStore({ shapeUtils: defaultShapeUtils }),
    []
  );

  const { bindStore } = useCollaboration({ documentId, token, store });
  const bound = useRef(false);

  useEffect(() => {
    if (bound.current) return;
    bound.current = true;
    bindStore();
  }, [bindStore]);

  return (
    <div style={{ position: "absolute", inset: 0, ...style }}>
      <Tldraw
        store={store}
        onMount={(editor) => {
          // Expose editor instance globally for debugging / AI integration
          (window as unknown as Record<string, unknown>)["__zenith_editor"] = editor;
        }}
      />
    </div>
  );
}

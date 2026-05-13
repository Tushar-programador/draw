import { Tldraw, type Editor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

interface Props {
  documentId: string;
  token: string;
  style?: React.CSSProperties;
  onEditorMount?: (editor: Editor) => void;
}

export function TldrawCanvas({ style, onEditorMount }: Props) {
  return (
    <div style={{ position: "absolute", inset: 0, ...style }}>
      <Tldraw
        onMount={(editor) => {
          (window as unknown as Record<string, unknown>)["__outdraw_editor"] = editor;
          onEditorMount?.(editor);
        }}
      />
    </div>
  );
}

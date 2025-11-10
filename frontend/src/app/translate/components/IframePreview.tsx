import { memo } from "react";

interface IframePreviewProps {
  ref: React.RefObject<HTMLIFrameElement>;
}

export const IframeComponent = memo(function IframePreview({
  ref,
}: IframePreviewProps) {
  console.log("😊 ~ IframePreview ~ 重新渲染:", ref);
  return (
    <iframe
      ref={ref}
      src={`http://localhost:8000/preview_new`}
      style={{ width: "100%", height: "100vh", border: "none" }}
    />
  );
});

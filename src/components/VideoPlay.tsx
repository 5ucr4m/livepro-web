import { AspectRatio } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

export const VideoPlayer: React.FC<{ stream?: MediaStream }> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <AspectRatio maxW="260px" ratio={16 / 9} background="#343434">
      <video
        data-testid="peer-video"
        style={{ width: "100%" }}
        ref={videoRef}
        autoPlay
        muted={true}
      />
    </AspectRatio>
  );
};

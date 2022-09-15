import { useState } from "react";

export const useUserMedia = (opts: MediaStreamConstraints) => {
  const [options] = useState(opts);
  const [mediaStream, setMediaStream] = useState<MediaStream | undefined>();

  const connect = async () => {
    setMediaStream(await navigator.mediaDevices.getUserMedia(options));
  };

  const disconnect = () => {
    setMediaStream(undefined);
  };

  return {
    mediaStream,
    connect,
    disconnect,
  };
};

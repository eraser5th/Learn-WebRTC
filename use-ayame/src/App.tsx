import { useEffect, useRef, useState } from "react";
import Ayame from "@open-ayame/ayame-web-sdk";
import "./App.css";
import { VideoCodecOption } from "@open-ayame/ayame-web-sdk/dist/connection/options";
import { useUserMedia } from "./hooks/useUserMedia";

const signalingUrl = "wss://ayame-labo.shiguredo.app/signaling";

function App() {
  const [options, setOptions] = useState(Ayame.defaultOptions);
  const [authnMetadata] = useState({ hoge: "fuga" });
  const [roomId] = useState("ayame-web-sdk-sample");

  const [clientId] = useState<string | null>();
  const [signalingKey] = useState<string | null>();
  const [videoCodec] = useState<VideoCodecOption | undefined>(undefined);
  useEffect(() => {
    if (clientId) {
      setOptions({
        ...options,
        clientId,
      });
    }
  }, [clientId]);
  useEffect(() => {
    if (signalingKey) {
      setOptions({
        ...options,
        signalingKey,
      });
    }
  }, [signalingKey]);
  useEffect(() => {
    setOptions({
      ...options,
      video: {
        ...options.video,
        codec: videoCodec,
      },
    });
  }, [videoCodec]);

  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const [conn] = useState(
    Ayame.connection(signalingUrl, roomId, options, true)
  );
  conn.on("open", ({ authzMetadata }: { authzMetadata: string }) =>
    console.log(authzMetadata)
  );
  conn.on("disconnect", (e: Event) => {
    console.log(e);
    if (localVideo.current) {
      localVideo.current.srcObject = null;
    }
    if (remoteVideo.current) {
      remoteVideo.current.srcObject = null;
    }
  });
  conn.on(
    "addstream",
    async (
      e: RTCTrackEvent & {
        stream: MediaStream;
      }
    ) => {
      console.log(e.stream);
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = e.stream;
      }
    }
  );
  useEffect(() => {
    return () => {
      conn.disconnect();
    };
  }, []);

  const userMedia = useUserMedia({
    audio: true,
    video: true,
  });
  useEffect(() => {
    const hoge = async () => {
      if (userMedia.mediaStream) {
        await conn.connect(userMedia.mediaStream, { authnMetadata });
        if (localVideo.current) {
          localVideo.current.srcObject = userMedia.mediaStream;
        }
      }
    };
    hoge();
  }, [userMedia.mediaStream]);

  return (
    <div className="App">
      <p>roomId: {roomId}</p>
      <p>clientId: {options.clientId}</p>
      <video ref={localVideo} />
      <video ref={remoteVideo} />
    </div>
  );
}

export default App;

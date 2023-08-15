import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
  useRef,
  useCallback,
  RefObject,
} from "react";
import { io } from "socket.io-client";
import Peer, { DataConnection } from "peerjs";

interface IWSContextData {
  myVideo?: RefObject<HTMLVideoElement>;
  userVideo?: RefObject<HTMLVideoElement>;
  connectToPeer: (id: string) => void;
  sendMessage: (message: string) => void;
}

const socket = io("https://livepro.onrender.com");
const peer = new Peer("5ucr4m-web", {
  debug: 3,
});

const SocketContext = createContext<IWSContextData>({} as IWSContextData);

export const CustomerSocketProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [socketID, setSocketID] = useState<string>("");
  const [peerID, setPeerID] = useState<string>("");
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const [isPeerConnected, setIsPeerConnected] = useState<boolean>(false);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    socket.on("connect", () => {
      setSocketID(socket.id);
      setIsSocketConnected(true);
    });

    socket.on("createMessage", (data) => {
      console.log(data);
    });

    socket.on("status", (data) => {
      if (data.status === "disconnected") {
        if (connection) {
          connection.close();
        }
        if (userVideo.current) {
          userVideo.current.srcObject = null;
        }
      }
    });

    socket.on("disconnect", () => {
      setSocketID("");
      setIsSocketConnected(false);
    });
  });

  useEffect(() => {
    peer.on("open", (id) => {
      setPeerID(id);
      setIsPeerConnected(true);
      socket.emit("userPeer", id);
    });

    peer.on("call", (call) => {
      call.answer(myVideo.current?.srcObject as MediaStream);

      call.on("stream", (userVideoStream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = userVideoStream;
        }
      });
    });
  }, []);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        if (myVideo.current && currentStream) {
          myVideo.current.srcObject = currentStream;
        }
      });
  }, []);

  const connectToPeer = (peerID: string) => {
    const conn = peer.connect(peerID);

    conn.on("open", () => {
      setConnection(conn);
      conn.send("Hello!");
    });

    conn.on("data", (data) => {
      console.log(data);
    });
  };

  const sendMessage = useCallback(
    (message: string) => {
      if (connection) {
        console.log("tem conexão");
        connection.send(message);
      }
    },
    [connection]
  );

  const values = useMemo(
    () => ({
      isSocketConnected,
      isPeerConnected,
      peerID,
      socketID,
      myVideo: myVideo,
      userVideo: userVideo,
      connectToPeer,
      sendMessage,
    }),
    [isSocketConnected, isPeerConnected]
  );

  return (
    <SocketContext.Provider value={values}>{children}</SocketContext.Provider>
  );
};

export function useWSConnection(): IWSContextData {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used within an SocketProvider!!");
  }

  return context;
}

export default useWSConnection;

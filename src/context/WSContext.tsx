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
  username: string;
  myVideo?: RefObject<HTMLVideoElement>;
  userVideo?: RefObject<HTMLVideoElement>;
  connectToPeer: (id: string) => void;
  sendMessage: (message: string) => void;
}

const socket = io("http://192.168.31.41:9001");
const peer = new Peer("5ucr4m-web");
// const peer = new Peer("5ucr4m-web", {
//   host: "192.168.31.41",
//   port: 9002,
//   path: "/peerjs",
//   config: {
//     iceServers: [
//       { url: "stun:stun01.sipphone.com" },
//       { url: "stun:stun.ekiga.net" },
//       { url: "stun:stunserver.org" },
//       { url: "stun:stun.softjoys.com" },
//       { url: "stun:stun.voiparound.com" },
//       { url: "stun:stun.voipbuster.com" },
//       { url: "stun:stun.voipstunt.com" },
//       { url: "stun:stun.voxgratia.org" },
//       { url: "stun:stun.xten.com" },
//       {
//         url: "turn:192.158.29.39:3478?transport=udp",
//         credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
//         username: "28224511:1379330808",
//       },
//       {
//         url: "turn:192.158.29.39:3478?transport=tcp",
//         credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
//         username: "28224511:1379330808",
//       },
//     ],
//   },

//   debug: 3,
// });

const SocketContext = createContext<IWSContextData>({} as IWSContextData);

export const CustomerSocketProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [socketID, setSocketID] = useState<string>("");
  const [peerID, setPeerID] = useState<string>("");
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const [isPeerConnected, setIsPeerConnected] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("5ucr4m");

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<MediaStream>(null);

  useEffect(() => {
    socket.on("connect", () => {
      setSocketID(socket.id);
      setIsSocketConnected(true);
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
      socket.emit("createMessage", `peerID: ${id}`);
    });

    peer.on("connection", (conn) => {
      console.log("connection", conn);
      conn.send("Hello! estou conectado");

      conn.on("data", (data) => {
        console.log(data);
      });

      conn.on("close", () => {
        console.log("desconectado");
      });
    });

    peer.on("call", (call) => {
      console.log("call", call);

      call.answer(myVideo.current?.srcObject as MediaStream);

      call.on("stream", (userVideoStream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = userVideoStream;
        }
      });

      call.on("close", () => {
        console.log("desconectado");
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

    conn.on("close", () => {
      setConnection(null);
      console.log("desconectado");
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
      username,
      isSocketConnected,
      isPeerConnected,
      peerID,
      socketID,
      myVideo: myVideo,
      userVideo: userVideo,
      connectToPeer,
      sendMessage,
    }),
    [username, isSocketConnected, isPeerConnected]
  );

  useEffect(() => {
    console.log(values);
  }, [values]);

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

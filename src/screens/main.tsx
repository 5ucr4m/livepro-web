import { AspectRatio, Button, Flex, HStack, Text } from "@chakra-ui/react";
import { useWSConnection } from "../context/WSContext";
import { useState } from "react";

export default function MainScreen() {
  const queryParameters = new URLSearchParams(window.location.search);
  const [myMicMutted, setMyMicMutted] = useState<boolean>(false);
  const [userMicMutted, setUserMicMutted] = useState<boolean>(false);
  const me = queryParameters.get("me");
  const to = queryParameters.get("to");

  const { connectToPeer, sendMessage, userVideo, myVideo } = useWSConnection();
  return (
    <Flex flexDir="column" w="100%" h="100vh" bg="#12171f">
      <Text color="white">Main Screen</Text>
      <Text color="white">{me}</Text>
      <Text color="white">{to}</Text>
      <HStack>
        <Button h="45px" onClick={() => connectToPeer(to ?? "flutter")}>
          Connectar
        </Button>
        <Button h="45px" onClick={() => sendMessage("oi cara...")}>
          Enviar mensagem
        </Button>
      </HStack>
      <HStack mt={4}>
        {myVideo && (
          <AspectRatio width="460px" ratio={16 / 9} background="#343434">
            <video
              data-testid="peer-video"
              style={{ width: "100%" }}
              ref={myVideo}
              autoPlay
              muted={myMicMutted}
              onClick={() => setMyMicMutted(!myMicMutted)}
            />
          </AspectRatio>
        )}

        <AspectRatio width="460px" ratio={16 / 9} background="#343434">
          <video
            data-testid="peer-video"
            style={{ width: "100%" }}
            ref={userVideo}
            autoPlay
            muted={userMicMutted}
            onClick={() => setUserMicMutted(!userMicMutted)}
          />
        </AspectRatio>
      </HStack>
    </Flex>
  );
}

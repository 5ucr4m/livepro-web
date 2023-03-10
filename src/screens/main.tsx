import { AspectRatio, Button, Flex, HStack, Text } from "@chakra-ui/react";
import { useWSConnection } from "../context/WSContext";

export default function MainScreen() {
  const { connectToPeer, sendMessage, userVideo, myVideo } = useWSConnection();
  return (
    <Flex flexDir="column" w="100%" h="100vh" bg="#12171f">
      <Text color="white">Main Screen</Text>
      <HStack>
        <Button h="45px" onClick={() => connectToPeer("5ucr4m-flutter")}>
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
              muted={true}
            />
          </AspectRatio>
        )}
        {userVideo && (
          <AspectRatio width="460px" ratio={16 / 9} background="#343434">
            <video
              data-testid="peer-video"
              style={{ width: "100%" }}
              ref={userVideo}
              autoPlay
              muted={true}
            />
          </AspectRatio>
        )}
      </HStack>
    </Flex>
  );
}

import { CustomerSocketProvider } from "./context/WSContext";
import MainScreen from "./screens/main";
import { ChakraProvider } from "@chakra-ui/react";

function App() {
  return (
    <ChakraProvider>
      <CustomerSocketProvider>
        <MainScreen />
      </CustomerSocketProvider>
    </ChakraProvider>
  );
}

export default App;

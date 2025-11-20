export interface ChatMessage {
  role: "user" | "model";
  message: string;
  isError?: boolean;
}

export interface GeminiMessagePart {
  text: string;
}

export interface GeminiMessage {
  role: "user" | "model";
  parts: GeminiMessagePart[];
}

export async function talkToAgent(
  newMessage: string,
  chatHistory: ChatMessage[],
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setIsThinking: React.Dispatch<React.SetStateAction<boolean>>,
  setIsTalking: React.Dispatch<React.SetStateAction<boolean>>
) {
  const newUserMessage: ChatMessage = {
    role: "user",
    message: newMessage,
  };

  // first add the user message to the history so it can render
  const newChatHistory = [...chatHistory, newUserMessage];

  console.log(newChatHistory);

  setChatHistory(newChatHistory);

  const history: GeminiMessage[] = newChatHistory.map((message) => {
    return {
      role: message.role,
      parts: [
        {
          text: message.message,
        },
      ],
    };
  });

  setIsThinking(true);
  
  try {
    const res = await fetch("/api/polaris", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context: history,
      }),
    });

    if (!res.ok || !res.body) {
      throw new Error("Failed to get response from Polaris");
    }

    // Create an initial empty model message that we'll update as chunks arrive
    const newModelMessage: ChatMessage = {
      role: "model",
      message: "",
    };
    
    // Add the empty message to chat history so it appears immediately
    setChatHistory((prev) => [...prev, newModelMessage]);
    setIsThinking(false);
    setIsTalking(true);

    // Read the stream
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      // Decode the chunk and accumulate it
      const chunk = decoder.decode(value, { stream: true });
      accumulatedText += chunk;

      // Update the last message in chat history (the streaming response)
      setChatHistory((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "model",
          message: accumulatedText,
        };
        return updated;
      });
    }
    setIsTalking(false);
    console.log("Final response:", accumulatedText);
  } catch (error) {
    console.error("Error talking to LLM:", error);
    
    // Add an error message to the chat using functional update
    const errorMessage: ChatMessage = {
      role: "model",
      message: "I apologize, stargazer. Something went wrong while consulting the stars. Please try again.",
      isError: true,
    };
    
    setChatHistory((prev) => [...prev, errorMessage]);
    setIsThinking(false);
    setIsTalking(false);
  }
}

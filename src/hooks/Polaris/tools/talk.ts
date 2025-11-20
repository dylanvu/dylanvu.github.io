export interface ChatMessage {
  role: "user" | "model";
  message: string;
  isError?: boolean;
  isPlaceholder?: boolean;
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
  setIsTalking: React.Dispatch<React.SetStateAction<boolean>>,
  placeholderMessage: string,
  errorMessage: string,
  onStreamChunk?: () => void
) {
  const newUserMessage: ChatMessage = {
    role: "user",
    message: newMessage,
  };

  // First add the user message to the history so it can render
  const newChatHistory = [...chatHistory, newUserMessage];

  // Add a placeholder message while thinking
  const placeholder: ChatMessage = {
    role: "model",
    message: placeholderMessage,
    isPlaceholder: true,
  };

  setChatHistory([...newChatHistory, placeholder]);

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

    // Replace the placeholder message with an empty message that will be streamed into
    setIsThinking(false);
    setIsTalking(true);
    
    // Replace the placeholder with an empty message ready for streaming
    setChatHistory((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        role: "model",
        message: "",
        isPlaceholder: false,
      };
      return updated;
    });

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

      onStreamChunk?.();

      // Update the last message in chat history (the streaming response)
      setChatHistory((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "model",
          message: accumulatedText,
          isPlaceholder: false,
        };
        return updated;
      });
    }
    setIsTalking(false);
  } catch (error) {
    console.error("Error talking to LLM:", error);
    
    // Replace the placeholder with an error message
    const errorMsg: ChatMessage = {
      role: "model",
      message: errorMessage,
      isError: true,
    };
    
    setChatHistory((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = errorMsg;
      return updated;
    });
    setIsThinking(false);
    setIsTalking(false);
  }
}

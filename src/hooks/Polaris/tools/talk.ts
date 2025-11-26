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

export interface ErrorMessages {
  default: string;
  rateLimit: string;
  serverError?: string;
  timeout?: string;
  network?: string;
}

export async function talkToAgent(
  newMessage: string,
  chatHistory: ChatMessage[],
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setIsThinking: React.Dispatch<React.SetStateAction<boolean>>,
  setIsTalking: React.Dispatch<React.SetStateAction<boolean>>,
  placeholderMessage: string,
  errorMessages: ErrorMessages,
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

    if (!res.ok) {
      // Determine the appropriate error message based on status code
      let errorMsg = errorMessages.default;
      
      if (res.status === 429) {
        errorMsg = errorMessages.rateLimit;
      } else if (res.status >= 500) {
        errorMsg = errorMessages.serverError || errorMessages.default;
      }
      
      throw new Error(errorMsg);
    }

    if (!res.body) {
      throw new Error(errorMessages.default);
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
    
    // Determine appropriate error message
    // If the error has a message (from our thrown errors), use it
    // Otherwise fall back to network error or default
    const errorMessage = error instanceof Error && error.message 
      ? error.message 
      : errorMessages.network || errorMessages.default;
    
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

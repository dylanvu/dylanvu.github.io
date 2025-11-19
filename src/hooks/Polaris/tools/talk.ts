export interface ChatMessage {
  role: "user" | "model";
  message: string;
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
  setIsThinking: React.Dispatch<React.SetStateAction<boolean>>
) {
  const newUserMessage: ChatMessage = {
    role: "user",
    message: newMessage,
  };

  const newChatHistory = [...chatHistory, newUserMessage];

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
  const res = await fetch("/api/polaris", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      context: history,
    }),
  });

  const resJson = await res.json();

  // handle gemini response
  const llmResponse = resJson.response;
  console.log(llmResponse);
  // add to history
  const newModelMessage: ChatMessage = {
    role: "model",
    message: llmResponse,
  };

  setChatHistory([...newChatHistory, newModelMessage]);
  setIsThinking(false);
}

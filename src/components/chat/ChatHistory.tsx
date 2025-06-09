"use client"

import { ChatMessage, useAgentContext } from "@/contexts/ai/AgentContext"
import { useEffect, useRef } from "react";

    // TODO: Add prebuilt options:
    // "can't decide = triggers the random button",
    // "give me a tour = triggers the general tour flow"

export default function ChatHistory() {
    const agentContext = useAgentContext();
    const chatHistoryRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        console.log(agentContext?.agentHistory)
        // scroll to bottom if agent history changes
        if (chatHistoryRef.current) {
            console.log("scrolling to bottom")
            chatHistoryRef.current.style.scrollBehavior = "smooth";
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [agentContext?.agentHistory]);

    function submitQuery(query: string) {
        const newUserMessage: ChatMessage = {
            role: "user",
            message: query
        }

        if (agentContext?.agentHistory) {
            agentContext?.setAgentHistory([...agentContext?.agentHistory, newUserMessage])
        }
    }

    return (
        <div className="chat-history-contents"
            ref={chatHistoryRef}>
            <div className="chat-history-messages">
                {agentContext?.agentHistory.map((message, index) => {
                    const messageType = message.role === "model" ? "model-message": "user-message"
                    return (
                        <div key={`${"chat-message-" + index}`} className={`chat-message ${messageType}`}>
                            {message.message}
                        </div>
                    )
                })}
            </div>
            <div className="chat-history-presets">
                <button className="interactable-element" onClick={() => submitQuery("Surprise me!")}>
                    Surprise me
                </button>
                <button className="interactable-element" onClick={() => submitQuery("Give me the full tour.")}>
                    The full tour
                </button>
            </div>
        </div>
    )
}
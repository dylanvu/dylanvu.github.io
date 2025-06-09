'use client'

import React, { useState } from "react";
import "@/styles/chat/chat.css"
import { ChatMessage, useAgentContext } from "@/contexts/ai/AgentContext";

export default function ChatInput() {
    const [query, setQuery] = useState<string>("")
    const agentContext = useAgentContext();

    function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setQuery(e.target.value);
    }

    function handleKeydown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // prevent newline
            submitQuery();
        }
    }

    function submitQuery() {
        const newUserMessage: ChatMessage = {
            role: "user",
            message: query
        }
        // add to the agent history
        if (agentContext?.agentHistory) {
            const newHistory = [...agentContext?.agentHistory, newUserMessage]
            agentContext?.setAgentHistory(newHistory)
        }

        // clear the input area
        setQuery("");
    }
    
    return (
        <textarea className="interactable-element-border" id="chat" placeholder="What do you want to see?" value={query} onChange={handleInput} onKeyDown={handleKeydown}/>
    )
}
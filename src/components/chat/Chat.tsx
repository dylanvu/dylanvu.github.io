'use client'

import { useEffect, useState } from "react";
import { useAgentContext } from "@/contexts/ai/AgentContext";
import "@/styles/chat/chat.css"
import ChatHistory from "@/components/chat/ChatHistory";
import ChatInput from "./ChatInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, motion, useAnimate } from "motion/react";

export default function Chat() {
    const agentContext = useAgentContext();
    const [scope, animate] = useAnimate();

    const [showChat, setShowChat] = useState<boolean>(true);

    function toggleChat() {
        setShowChat((prev) => !prev)
    }

    useEffect(() => {
        // add a slight delay to the rendering of the chat
        animate(scope.current, { opacity: 1 }, { delay: 0.7 })
    }, []);

    return (
        <div className="chat-container">
            <AnimatePresence>
                {showChat && (
                    <motion.div className="chat-content-container"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ ease: "easeInOut", duration: 0.2 }}
                        key="chat-content-container"
                        ref={scope}
                    >
                        <div className="chat-header">
                            Dylan's Tour Guide
                        </div>
                        <div className="chat-main">
                            <ChatHistory />
                            <ChatInput />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <button className={`show-chat-button ${ showChat ? null : "shimmer"}`} onClick={toggleChat}>
                <FontAwesomeIcon icon={faRobot} className="show-chat-button-icon"/>
            </button>
        </div>
    )
}
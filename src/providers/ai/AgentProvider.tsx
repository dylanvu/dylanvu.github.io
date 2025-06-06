'use client'
import React, { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AgentContext } from "@/contexts/ai/AgentContext";

export default function AgentProvider({ children }: {
  children: React.ReactNode;
}) {

    const router = useRouter();
    const pathName = usePathname();
    
    /**
     * the chat history the agent needs to know what's going on
     */
    const [agentContext, setAgentContext] = useState<string[]>([]);

    /**
     * the page content so the agent knows where the user is at
     */
    const [currentPage, setCurrentPageContent] = useState<string>();
    
    useEffect(() => {
        // load up the textual representation of my webste as the original context
    }, [])

    useEffect(() => {
        // fetch current page information
        console.log(pathName)
    }, [pathName])


    // define all the agent actions

    /**
     * this function enables the agent to move the user to a different page
     * @param path the path to go to. Example: "/about"
     */
    function navigate(path: string) {
        router.push(path);
    }

    // DOM manipulation functions
    function applyStyleToDom() {
        // adjusting or applying style (highlight, boxing)
    }

    function addIdToDom() {
        // adding ID dynamically (for the scrolling ability)
    }
    // scrolling?
    // ability to talk?uu

    return (
        <AgentContext.Provider>
            {children}
        </AgentContext.Provider>
    )
}
'use client'
import React, { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AgentContext, CurrentPageType } from "@/contexts/ai/AgentContext";

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
    const [currentPage, setCurrentPageContent] = useState<CurrentPageType>({
        path: pathName,
        contents: "" // TODO: FIXME
    });
    
    useEffect(() => {
        // load up the textual representation of my webste as the original context
    }, [])

    useEffect(() => {
        // fetch current page information
        console.log(pathName)
        retrieveCurrentPageContents()
    }, [pathName])


    // define all the agent actions

    /**
     * this function enables the agent to move the user to a different page
     * @param path the path to go to. Example: "/about"
     */
    function navigate(path: string) {
        router.push(path);
    }

    /**
     * this function scrapes the current page contents
     */
    function retrieveCurrentPageContents() {
        const currentDOM = document.getElementById("agent_root");
        if (!currentDOM) {
            console.error("Unable to retrieve website root for AI agent");
        } else {
            console.log(currentDOM)
            const currentPage: CurrentPageType = {
                path: pathName,
                contents: currentDOM.outerHTML
            }
            setCurrentPageContent(currentPage);
        }
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
        <AgentContext.Provider value={{ agentContext, setAgentContext, currentPage, setCurrentPageContent }}>
            {children}
        </AgentContext.Provider>
    )
}
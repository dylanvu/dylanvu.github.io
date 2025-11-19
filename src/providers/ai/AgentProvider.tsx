"use client";
import React, { useRef, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AgentContext,
  ChatMessage,
  CurrentPageType,
} from "@/contexts/ai/AgentContext";

import { Project } from "@/app/api/util";
import { GeminiMessage } from "@/app/api/polaris/route";

export default function AgentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathName = usePathname();

  const initialMessage: ChatMessage = {
    role: "model",
    message:
      "Hi there! Welcome to Dylan's website! What would you like to see or know?",
  };

  /**
   * the chat history the agent needs to know what's going on
   */
  const [agentHistory, setAgentHistory] = useState<ChatMessage[]>([
    initialMessage,
  ]);

  const [isThinking, setIsThinking] = useState<boolean>(false);

  const projectsRef = useRef<Project[]>([]);

  /**
   * the page content so the agent knows where the user is at
   */
  const currentPageRef = useRef<CurrentPageType>({
    path: pathName,
    contents: "", // TODO: FIXME
  });

  useEffect(() => {
    // load up the textual representation of my webste as the original context
    fetch("/api/projects")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        return response.json();
      })
      .then((projects) => {
        projectsRef.current = projects;
      });
  }, []);

  useEffect(() => {
    // fetch current page information
    retrieveCurrentPageContents();
  }, [pathName]);

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
    const currentPage: CurrentPageType = {
      path: pathName,
      contents: currentDOM
        ? currentDOM.outerHTML
        : "Unable to fetch page contents",
    };
    currentPageRef.current = currentPage;
  }

  // // DOM manipulation functions
  // function applyStyleToDom() {
  //   // adjusting or applying style (highlight, boxing)
  // }

  // function addIdToDom() {
  //   // adding ID dynamically (for the scrolling ability)
  // }
  // // scrolling?
  // // ability to talk?

  async function talkToAgent(newMessage: string) {
    const newUserMessage: ChatMessage = {
      role: "user",
      message: newMessage,
    };

    const newAgentHistory = [...agentHistory, newUserMessage];

    setAgentHistory(newAgentHistory);

    const history: GeminiMessage[] = newAgentHistory.map((message) => {
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
    const res = await fetch("/api/tour-guide", {
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

    setAgentHistory([...newAgentHistory, newModelMessage]);
    setIsThinking(false);
  }

  function goToRandomProject() {
    // remove out matching url from the list of projects
    const validProjects = projectsRef.current.filter(
      (project) => project.url !== pathName
    );
    const randomProject =
      validProjects[Math.floor(Math.random() * validProjects.length)];

    navigate(randomProject.url);
  }

  return (
    <AgentContext.Provider
      value={{
        agentHistory,
        setAgentHistory,
        currentPageRef,
        goToRandomProject,
        talkToAgent,
        isThinking,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

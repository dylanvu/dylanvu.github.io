"use client";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";
import StargazerMessage from "@/components/star-revamp/Star/Polaris/StargazerMessage";
import PolarisMessage from "@/components/star-revamp/Star/Polaris/PolarisMessage";

export default function PolarisChat() {
  const { polarisHistory } = usePolarisContext();
  return (
    <div style={{}}>
      {polarisHistory.map((message, i) => {
        const key = `polaris-chat-${i}`;
        if (message.role === "user") {
          return <StargazerMessage key={key} message={message.message} />;
        } else {
          return <PolarisMessage key={key} message={message.message} />;
        }
      })}
    </div>
  );
}

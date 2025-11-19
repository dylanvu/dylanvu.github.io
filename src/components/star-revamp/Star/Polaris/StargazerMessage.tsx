export default function StargazerMessage({ message }: { message: string }) {
  return (
    <div
      style={{
        textAlign: "right",
      }}
    >
      <h1>You</h1>
      <div>{message}</div>
    </div>
  );
}

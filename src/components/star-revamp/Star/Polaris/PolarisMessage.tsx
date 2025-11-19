export default function PolarisMessage({ message }: { message: string }) {
  return (
    <div
      style={{
        textAlign: "left",
      }}
    >
      <h1>Polaris</h1>
      <div>{message}</div>
    </div>
  );
}

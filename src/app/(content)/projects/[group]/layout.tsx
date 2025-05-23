import { handleGenerateStaticParams } from "./util";
// we need this layout.tsx: https://github.com/vercel/next.js/issues/42840#issuecomment-1352105907
export async function generateStaticParams() {
  return await handleGenerateStaticParams();
}

export default function ({ children }: { children: React.ReactNode }) {
  return children;
}

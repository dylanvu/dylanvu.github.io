import { handleGenerateStaticParams } from "./util";

// dynamically generate each project page from the parameter
// https://github.com/vercel/next.js/issues/42840#issuecomment-1352105907
export async function generateStaticParams({
    params: { group },
}: {
    params: { group: string }
}) {
    return handleGenerateStaticParams(group);
}


export default function ({ children }: { children: any }) { return children }

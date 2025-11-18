import StarMarkdownRenderer from "../StarMarkdownRenderer";

export default function StarPanel({
  markdown,
  slug,
}: {
  markdown: string;
  slug: string;
}) {
  return (
    <div>
      <StarMarkdownRenderer markdown={markdown} />
    </div>
  );
}

import "../../styles/content-block/content-block.css"

export default function ContentBlockTitle({ title }: { title: string }) {

    return (
        <div className="content-block-title" >
            {title}
        </div>
    )
}
import ChildrenInterface from "~/types/children-interface";

export function LabelGroup (props: ChildrenInterface) {
    return (
        <div className="grid gap-1 content-start">
            {props.children || ''}
        </div>
    )
}

export function Label (props: ChildrenInterface) {
    return (
        <span className="text-muted-foreground text-sm">
            {props.children || ''}
        </span>
    )
}

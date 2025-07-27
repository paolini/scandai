import { CSSProperties } from "react"

export const htmlTitleStyle: CSSProperties = {
    fontSize: 24, 
    textAlign: 'left',
}

export const htmlBoldTitleStyle: CSSProperties = {
    fontSize: 24, 
    textAlign: 'left',
    fontWeight: 'bold',
    paddingBottom: '1em',
}

export default function ReportTitle({title, hide, bold, setHide}:{
    title?:string,
    hide?:boolean,
    bold?:boolean,
    setHide?: (b:boolean) => void,
}) {
    if (!title) return null
    return <h3 className="avoid-break-after" style={bold ? htmlBoldTitleStyle : htmlTitleStyle}>
        {setHide && (hide ? <span className="noPrint" onClick={() => setHide(false)} style={{cursor: "pointer"}} >&#9655;</span> : hide==undefined?"":<span className="noPrint" onClick={() => setHide(true)} style={{cursor:"pointer"}}>&#9661;</span>)}
        {} {title}
    </h3>
}


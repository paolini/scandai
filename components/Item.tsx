import { ReactNode } from "react"
import classNames from 'classnames'

import ReportTitle from "./ReportTitle"

export default function Item({title, small, avoidBreakInside, avoidBreakBefore, children}: {
    title?: string,
    small?: boolean,
    avoidBreakInside?: boolean,
    avoidBreakBefore?: boolean,
    children: ReactNode,
    }) {    
    return <div className={classNames({
            "avoid-break-inside" : avoidBreakInside,
            "avoid-break-before" : avoidBreakBefore,
        })}>
        <ReportTitle title={title} />
        <div className="mb-5" style={{maxWidth: small ? 400 : 640}}>
        { children }
        </div>
    </div>
}


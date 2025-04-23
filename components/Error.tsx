import { Button } from "react-bootstrap"

export default function Error({ dismiss, children }: { 
    dismiss?: () => void,
    children: React.ReactNode }) {
    return <div className="alert alert-danger">
        {dismiss && <Button className="btn-close mr-1" onClick={() => dismiss()}></Button>}
        {children}
    </div>
}
export default function Error({ children }: { children: React.ReactNode }) {
    return <div className="alert alert-danger">
        {children}
    </div>
}
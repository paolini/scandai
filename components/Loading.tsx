import ReactLoading from 'react-loading'

export default function Loading({children}:{
    children?: React.ReactNode
}) {
    return <>
        <ReactLoading color="lightblue"/>
        {children}
    </>
}
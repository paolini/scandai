import React from 'react'

export default function Messages({messages, setMessages}
    : {
        messages:string[],
        setMessages:React.Dispatch<React.SetStateAction<string[]>>
    }) {
        return <ul>
            {messages.map((message, index) => 
                <li key={index} 
                    onClick={() => setMessages(messages.filter(msg => msg !== message))}>
                        {message}
                </li>)}
        </ul>
}
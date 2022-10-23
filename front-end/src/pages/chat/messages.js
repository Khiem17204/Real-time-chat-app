import styles from './styles.module.css';
import {useState, useEffect, useRef } from 'react';

const Messages = ({socket}) => {
    const [ messagesReceived, setMessagesReceived ] = useState([]);

    const messagesColumnRef = useRef(null);

    useEffect(() => {
        socket.on('receive_message', (data) => {
            console.log(data);
            setMessagesReceived((state) => [
                ...state,
                {
                    message: data.message,
                    username: data.username,
                    __createdtime__: data.__createdtime__,
                },
            ]);
        });

        //remove event listener on component unmount
        return() => socket.off('receive_message');
    }, [socket]);

    useEffect(() => {
        socket.on('last_100_messages', (last100Messages) => {
            console.log('Last 100 message:', JSON.parse(last100Messages));
            last100Messages = JSON.parse(last100Messages);
            last100Messages = sortMessagesByDate(last100Messages);
            setMessagesReceived((state)=> [...last100Messages,...state]);
        });

        return() => socket.off('last_100_messages');
    }, [socket]);


    //scroll to the most recent page
    useEffect(()=> {
        messagesColumnRef.current.scrollTop = 
            messagesColumnRef.current.scrollHeight;
    }, [messagesReceived]);

    //sort messages by date
    function sortMessagesByDate(messages){
        return messages.sort(
            (a,b) => parseInt(a.__createdtime__) - parseInt(b.__createdtime__)
        );
    }


    // dd/mm/yyyy, hh:mm:ss
    function formatDateFromTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    return (
        <div className={styles.messagesColumn} ref ={messagesColumnRef}>
            {messagesReceived.map((msg,i) =>(
                <div className={styles.message} key={i}>
                    <div style={{display: 'flex', justifyContent: 'space-between' }}>
                        <span className={styles.msgMeta}>{msg.username}</span>
                        <span className={styles.msgMeta}>
                            {formatDateFromTimestamp(msg.__createdtime__)}
                        </span>
                    </div>
                    <p className={styles.msgText}>{msg.message}</p>
                    <br />
                </div>
            ))}
        </div>
    );
};

export default Messages;
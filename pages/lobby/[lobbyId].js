import { useRouter } from 'next/router'
import React from 'react'
import Context from '../../res/Context';
import Button from '../../components/usefull/Button';
import Header from '../../components/header/Header';

export default function Lobby(){
    const router = useRouter()
    const { lobbyId } = router.query;
    
    const { is_logged_in, get_socket } = React.useContext(Context);

    React.useEffect(() => {
        const isAllowedToJoin = async() => {
            let response = await fetch('/api/lobby/canJoinLobby', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    lobbyCode: lobbyId
                })
            });

            response = await response.json();

            if(response.code != 200){
                console.log(response.msg);
                router.push('/');
                return;
            } else {
                const socket = get_socket();
                socket.emit('join_lobby', lobbyId);
            }
        }

        if(lobbyId && get_socket() != null){
            isAllowedToJoin();
        } 
        
    }, [lobbyId, get_socket()])

    const[text, setText] = React.useState("");

    const buttonCallBack = () => {
        console.log("BUtton Callback");
    }

    return(
        <div>
            <Header isLoggedIn={is_logged_in()} />

            <h1>Lobby { lobbyId }</h1>

            <Button type="header" callback={buttonCallBack}>Hello</Button>

            <input type="text" value={text} onChange={(v) => setText(v.target.value)} ></input>
        </div>
    )
}
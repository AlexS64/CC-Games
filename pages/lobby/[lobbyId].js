import { useRouter } from 'next/router'
import React from 'react'
import Context from '../../res/Context';
import Button from '../../components/usefull/Button';
import Header from '../../components/header/Header';


export default function Lobby(){
    const router = useRouter()
    const { lobbyId } = router.query;
    
    const { is_logged_in, get_socket, join_lobby} = React.useContext(Context);

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
                join_lobby(lobbyId);
                const socket = get_socket();
                socket.emit('join_lobby', lobbyId);
            }
        }

        if(lobbyId && get_socket() != null){
            isAllowedToJoin();
        } 
        
        if(is_logged_in() == false){
            router.push('/');
        }

    }, [lobbyId, get_socket(), is_logged_in()])

    /*
    React.useEffect(() => {
        const handleChange = (url) => {
            const socket = get_socket();
            if(!url.includes('lobby')){
                console.log("Sending Leave Call: " + url)
                socket?.emit('leave_lobby');
            }

        }
        
        router.events.on('routeChangeStart', handleChange);
        
        return () => {
            router.events.off('routeChangeStart', handleChange);
        }

    }, [router])
    */

    

    return(
        <div className='bg-blue-300 h-screen w-screen'>
            <Header isLoggedIn={is_logged_in()} />

            



        </div>
    )
}
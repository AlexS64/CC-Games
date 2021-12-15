/*
TODO:
- Create all sockets callbacks
- Create a beautiful UI for the lobbys

- Rewrite the whole socket Idea:
- One socket per user -> UserSocket.
  -> The socket has events for:
    -> the user (dm, invitations, etc)
    -> lobby (msg, join, dc)
    -> ingame

  
*/
import { useRouter } from 'next/router'

import Head from 'next/head'
import Header from '../components/header/Header'
import NavHeader from '../components/NavHeader/NavHeader';
import React from 'react';
import Context from '../res/Context';
import Button from '../components/usefull/Button';
import { io } from 'socket.io-client';
import FriendViewer from '../components/friends/FriendViewer';

export default function Home() {
  const router = useRouter();
  
  const { logout, login_with_email, is_logged_in, set_socket } = React.useContext(Context);

  const lobbyCallback = async () => {
    let response = await fetch('/api/lobby/createLobby');
    response = await response.json();

    if(response.code == 200){
      
      router.push("/lobby/" + response.lobbyCode);
    }
  }

  const [lobbyCode, setLobbyCode] = React.useState("");

  const lobbyJoinCallback = async () => {
    if(lobbyCode.length != 6){
      alert("Lobby Code not 6 Digits !");
      return;
    }

    let response = await fetch('/api/lobby/joinLobby', {
      method:"POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body:JSON.stringify({
        lobbyCode: lobbyCode
      })
    });
  
    response = await response.json();

    if(response.code == 200){
      router.push('/lobby/' + response.lobbyCode);
    }
  
  }


  return (
    <div>
      <Head>
        <title>CC-Games | HOME</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header isLoggedIn={is_logged_in()}></Header>

      <NavHeader> </NavHeader>

      {is_logged_in()?
        <>

          <Button type="header" callback={() => lobbyCallback()}>Create Lobby</Button>

          <input type="number" value={lobbyCode} onChange={v => {setLobbyCode(v.target.value); }} className="caret-blue-800"/>

          <Button type ="header" callback={() => lobbyJoinCallback()}>Join Lobby</Button>

          <FriendViewer />

        </>

        : null
      }

    </div>
  )
}
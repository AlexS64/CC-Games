/*
TODO: 
Make sure every SID is unique !! -> extract ID generation into seperate file
*/

import Head from 'next/head'
import Header from '../components/header/Header'
import React from 'react';
import { useCookies } from 'react-cookie';
import Context from '../res/Context';

export default function Home() {
  //Only Useable for cookie Loading onLoad
  const [cookies, setCookie, removeCookie] = useCookies(['s_id']);

  React.useState(() => {
    const validateSid = async() => {
      //Load E-Mail from Storage
      let email = "testuser@cc-games.com";

      let response = await fetch('/api/auth/validateSession', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email
        })
      });

      response = await response.json();
      console.log(response);

      if(response.code != 200){
        //Email and SID not valid
        removeCookie('s_id');
      } else {
        dispatch({type: 'SET_LOGIN_WITH_COOKIE', payload: email});
      }
    }

    if(cookies.s_id){
      validateSid();
    }    

    
  }, []);


  const [state, dispatch] = React.useReducer(reducer, {
    //Initial State
    isLoggedIn: false,
    email: null,



  });

  const context = React.useMemo(() => ({
    get_email: () => {return state.email},
    
    logout: () => {dispatch({type: 'LOGOUT'})},
    login_with_email: (email) => { dispatch({type: "SET_LOGIN_WITH_EMAIL", payload: email}) },
    login_register: (email) => { dispatch({type: 'SET_LOGIN_REGISTER', payload: email})},
  }));

  return (
    <div>
      <Head>
        <title>CC-Games | HOME</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Context.Provider value={context}>
        <Header isLoggedIn={state.isLoggedIn}></Header>

      </Context.Provider>

    </div>
  )
}

function reducer(state, action){
  switch(action.type){
    case 'SET_LOGIN_WITH_COOKIE': return {...state, isLoggedIn: true, email: action.payload}
    case 'SET_LOGIN_WITH_EMAIL': return {...state, isLoggedIn: true, email: action.payload}
    case 'SET_LOGIN_REGISTER': return {...state, isLoggedIn: true, email: action.payload}
    case 'LOGOUT': return {...state, isLoggedIn: false, email: null}

    default: return state;
  }
}
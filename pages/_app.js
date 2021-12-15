import { CookiesProvider } from 'react-cookie';
import 'tailwindcss/tailwind.css'
import Context from '../res/Context';
import React from 'react';
import { useCookies } from 'react-cookie';
import { io } from 'socket.io-client';

function MyApp({ Component, pageProps }) {
  //Only Useable for cookie Loading onLoad
  const [cookies, setCookie, removeCookie] = useCookies(['u_id']);
  
  //Checking for AUTH cookies and if they are valid
  //Also Reconnecting to the User Socket
  React.useEffect(() => {
    const validateUid = async() => {
      let response = await fetch('/api/auth/validateSession');
      response = await response.json()

      if(response.code != 200){
        dispatch({type: 'LOGOUT'})
      } else {
        dispatch({type: 'SET_LOGIN_WITH_EMAIL', payload: response.email});
      
        //Try to reconnect to the socket
        fetch('/api/auth/userSocket').finally(() => {
          const socket = io();
          applySocketCallbacks(socket);
          dispatch({type: 'SET_SOCKET', payload: socket});

          console.log("Auto Reconnect Succesfull");
        })
      }
    }

    //if(cookies.u_id){
      validateUid();
    //} else {
    //  dispatch({type: 'LOGOUT'});
    //}
  }, []);

  const [state, dispatch] = React.useReducer(reducer, {
    //Initial State
    isLoggedIn: null, //Null on Init. After Init true or false
    email: null,
    socket: null, // The socket User-Socket obj

    //Special parameters
  });
  
  const context = React.useMemo(() => ({
    get_email: () => {return state.email},
    
    logout: () => { state.socket?.emit('logout'); dispatch({type: 'LOGOUT'})},
    login_with_email: (email) => {  dispatch({type: "SET_LOGIN_WITH_EMAIL", payload: email}) },
    login_register: (email) => { dispatch({type: 'SET_LOGIN_REGISTER', payload: email})},
    
    is_logged_in: () => {return state.isLoggedIn},

    set_socket: (socket) => { applySocketCallbacks(socket); dispatch({type:'SET_SOCKET', payload: socket}) },
    get_socket: () => { return state.socket }
  
  }));

  return (    
    <CookiesProvider>
      <Context.Provider value={context}>
        <Component {...pageProps} />
      </Context.Provider>
    </CookiesProvider>
  )
}

function reducer(state, action){
  switch(action.type){
    case 'SET_LOGIN_WITH_COOKIE': return {...state, isLoggedIn: true, email: action.payload}
    case 'SET_LOGIN_WITH_EMAIL': return {...state, isLoggedIn: true, email: action.payload}
    case 'SET_LOGIN_REGISTER': return {...state, isLoggedIn: true, email: action.payload}
    case 'LOGOUT': return {...state, isLoggedIn: false, email: null}

    case 'SET_SOCKET': return {...state, socket: action.payload}

    default: return state;
  }
}

function applySocketCallbacks(socket){
  
  socket.on('message_from_friend', (message) => {
    alert("Got a new Message: " + message);
  })

  socket.on('message_from_lobby', (message) => {
    alert("Message from Lobby: " + message);
  })
}

export default MyApp
import router, { useRouter } from 'next/router';
import React, { useRef } from 'react';
import { io } from 'socket.io-client';
import Context from '../../res/Context';
import Button from '../usefull/Button';

export default function Header({isLoggedIn}){
    const [loginModalOpen, setLoginModalOpen] = React.useState(false);
    const [registerModalOpen, setRegisterModalOpen] = React.useState(false);

    const {logout, login_with_email, login_register, get_email, set_socket, is_in_lobby, leave_lobby} = React.useContext(Context);

    const router = useRouter();

    return(
        <div 
            className={"flex h-16 container m-auto justify-between p-4 " + ((is_in_lobby() != null)? "border-2 border-red-400 border-t-0 rounded-md rounded-t-none drop-shadow-lg from-purple-700 to-blue-500 bg-gradient-to-t cursor-pointer" : "")}
            onClick={() => {(is_in_lobby())? router.push('/lobby/' + is_in_lobby()) : null}}
            >
            
            
            <Logo></Logo>

            {(is_in_lobby() != null)? 
                <LobbyView lobbyCode={is_in_lobby()} leaveLobby={leave_lobby} />
                : null
            }
            
            {isLoggedIn != null? 
                (isLoggedIn? 
                    <Profile get_email={get_email} logout={logout}/>
                    :
                    <LoginRegister setLoginModalOpen={setLoginModalOpen} setRegisterModalOpen={setRegisterModalOpen}/>
                )
                : null
                
            }


            {loginModalOpen? <LoginModal socketCallback={set_socket} setModalOpen={setLoginModalOpen} loginCallback={login_with_email} /> : null}
 
            {registerModalOpen? <RegisterModal socketCallback={set_socket} setModalOpen={setRegisterModalOpen} registerCallback={login_register} /> : null}

        </div>
    )
}

const Logo = () => {
    return (
        <p>CC-Games</p>
    )
}

const LobbyView = ({lobbyCode, leaveLobby}) => {
    
    const {get_socket} = React.useContext(Context);
    const router = useRouter();


    const leaveLobbyCallback = async() => {
        let response = await fetch('/api/lobby/leaveLobby', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                lobbyCode: lobbyCode
            })
        });

        response = await response.json();

        if(response.code == 200){
            get_socket().emit('leave_lobby');
            leaveLobby();
            router.push("/");
        }
    }

    return(
        <div className='flex'>
            <p>In Lobby: {lobbyCode}</p>
            {(router.route.includes("lobby"))?
                <Button type="header" callback={() => leaveLobbyCallback()} >Leave</Button>
                : null
            }
        </div>
    )
}

const LoginRegister = ({setLoginModalOpen, setRegisterModalOpen}) => {
    return (
        <div className="space-x-2">
            <Button type="header" callback={() => setLoginModalOpen(true)}>Login</Button>
            
            <Button type="header" callback={() => setRegisterModalOpen(true)}>Register</Button>
        </div>
    )
}

const Profile = ({get_email, logout}) => {
    const router = useRouter();
    
    const doLogout = async() => {
        let email = get_email();

        let response = await fetch('/api/auth/logout', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
            })
        });

        response = await response.json();

        if(response.code == 200){
            router.push('/');
            logout();
        }
    }
    
    return (
        <div className="space-x-2">
            <p className="inline-block">Profile</p>

            <Button type="header" callback={() => doLogout()}>Logout</Button>
        </div>
    )
}

const LoginModal = ({socketCallback, setModalOpen, loginCallback}) => {
    const [errorMessage, setErrorMessage] = React.useState("");
    
    const [state, setState] = React.useState({
        username: "testuser@cc-games.com",
        password: "123456789",
        usernameClassList: "",
        passwordClassList: "",
    })

    const modalClickHandler = (event) => {
        const LoginModal = document.getElementById("LoginModal");

        if(!event.nativeEvent.path.includes(LoginModal)){
            setModalOpen(false);
        }
    }

    const doLoginCall = async() => {
        let complete = true;

        if(state.username.length == 0){
            setState({...state, usernameClassList: "border-0 border-b-2 border-red-500"});
            complete = false;
        }
        
        if(state.password.length == 0){
            setState({...state, passwordClassList: "border-0 border-b-2 border-red-500"});
            complete = false;
        }

        if(!complete)
            return;

        let payload = {
            email: state.username,
            password: state.password,
        };

        let response = await fetch('/api/auth/login', {
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        response = await response.json();

        if(response.code == 200){
            loginCallback(response.email);
            setModalOpen(false);

            //Try to connect to the Socket
            fetch('/api/auth/userSocket').finally(() => {
                const socket = io();
                socketCallback(socket);
            })

        } else {
            setErrorMessage("E-Mail / Password do not match");

            if(response.code == 300){
                setErrorMessage("E-Mail / Password missing");
            }
        }

        
    }
    
    
    return(
        <div 
            className="w-screen h-screen bg-black bg-opacity-40 absolute top-0 left-0 flex justify-center items-center"
            onClick={(event) => modalClickHandler(event)}
        >
            <div className="bg-white rounded-md animate-popIn" id="LoginModal">

                <div className="w-full bg-red-700 text-center text-white py-1 rounded-t-md shadow-md">
                    <p className="font-bold text-2xl pb-2">Login</p>
                </div>
                <div className="p-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="headerLoginUsername">Username</label>
                        <input 
                            value={state.username} 
                            onChange={(event) => {setState({...state, username: event.target.value, usernameClassList: ""})}} 
                            className={("shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline " + state.usernameClassList)} 
                            id="headerLoginUsername" 
                            type="text" 
                            placeholder="Username">
                        </input>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="headerLoginPassword">Password</label>
                        <input 
                            value={state.password} 
                            onChange={(event) => {setState({...state, password: event.target.value, passwordClassList: ""})}}  className={("shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline " + state.passwordClassList)} 
                            id="headerLoginPassword" 
                            type="password" 
                            placeholder="Password">
                        </input>
                        <p className="text-red-500 text-s italic text-center mt-2">{errorMessage}</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <Button type="header" callback={() => {doLoginCall()}}>Login</Button>
                        <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">Forgot Password?</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

const RegisterModal = ({socketCallback, setModalOpen, registerCallback, isFullOpen}) => {
    const modalClickHandler = (event) => {
        const LoginModal = document.getElementById("RegisterModal");

        if(!event.nativeEvent.path.includes(LoginModal)){
            setModalOpen(false);
        }
    }

    const[errorMessage, setErrorMessage] = React.useState("");

    const [state, setState] = React.useState({
        isFullOpen: isFullOpen || false,
        username: "",
        code: "",
        password: "",
        passwordConfirm: "",

        usernameClassList: "",
        codeClassList: "",
        passwordClassList: "",
        passwordConfirmClassList: "",
    });
    
    const doRegisterCall = async () => {
        if(state.isFullOpen){
            //Do confirm Call
            let complete = true;

            if(state.username.length == 0){
                setState({...state, usernameClassList: "border-0 border-b-2 border-red-500"});
                complete = false;
            }

            if(state.code.length == 0){
                setState({...state, codeClassList: "border-0 border-b-2 border-red-500"});
                complete = false;
            }

            if(state.password.length == 0){
                setState({...state, passwordClassList: "border-0 border-b-2 border-red-500"});
                complete = false;
            }

            if(state.passwordConfirm.length == 0){
                setState({...state, passwordConfirmClassList: "border-0 border-b-2 border-red-500"});
                complete = false;
            }

            if(!complete)
                return;

            let payload = {
                email: state.username,
                code: state.code,
                password: state.password,
                passwordConfirm: state.passwordConfirm,
            };

            let response = await fetch('/api/auth/confirm', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            response = await response.json();

            if(response.code == 200){
                registerCallback(response.email);
                setModalOpen(false);

                //Try to connect to the socket
                fetch('/api/auth/userSocket').finally(() => {
                    const socket = io();
                    socketCallback(socket);
                })
            } else {
                setErrorMessage(response.msg);
            }
        } else {
            //Do Register Call
            if(state.username.length == 0){
                setState({...state, usernameClassList: "border-0 border-b-2 border-red-500"})
                return;
            }

            let response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: state.username
                })
            })

            response = await response.json();

            if(response.code == 200){
                setState({...state, isFullOpen: true});
            } else {
                setErrorMessage(response.msg);
            }
        }
    }

    
    return(
        <div 
            className="w-screen h-screen bg-black bg-opacity-40 absolute top-0 left-0 flex justify-center items-center"
            onClick={(event) => modalClickHandler(event)}
        >
            <div className="bg-white rounded-md" id="RegisterModal">

            <div className="w-full bg-red-700 text-center text-white py-1 rounded-t-md shadow-md">
                    <p className="font-bold text-2xl pb-2">Register</p>
                </div>

                <div className="p-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="headerRegisterUsername">Username</label>
                        <input 
                            value={state.username} 
                            onChange={(event) => {setState({...state, username: event.target.value, usernameClassList: ""})}} 
                            className={("shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline " + state.usernameClassList)} 
                            id="headeRegisterUsername" 
                            type="text" 
                            placeholder="Username">
                        </input>
                    </div>
                    
                    {state.isFullOpen? 
                    <>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="headerRegisterCode">Code</label>
                            <input
                                value={state.code}
                                className={("shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline " + state.usernameClassList)}   
                                onChange={(event) => {setState({...state, code: event.target.value, codeClassList: ""})}}
                                id="headerRegisterCode"
                                type="text"
                                placeholder="Code"
                                maxLength={6}
                            >
                            </input>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="headerRegisterPassword">Password</label>
                            <input
                                value={state.password}
                                className={("shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline " + state.usernameClassList)}   
                                onChange={(event) => {setState({...state, password: event.target.value, passwordClassList: ""})}}
                                id="headerRegisterPassword"
                                type="password"
                                placeholder="Password"
                            >
                            </input>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="headerRegisterPasswordConfirm">Password Confirm</label>
                            <input
                                value={state.passwordConfirm}
                                className={("shadow appearance-none border rounded w-full py-2 px-3 te-gray-700 leading-tight focus:outline-none focus:shadow-outline " + state.usernameClassList)}   
                                onChange={(event) => {setState({...state, passwordConfirm: event.target.value, passwordConfirmClassList: ""})}}
                                id="headerRegisterPasswordConfirm"
                                type="password"
                                placeholder="Password Confirm"
                            >
                            </input>
                        </div>
                    </>
                    : null}

                    <div className="mb-4">
                        <p className="text-red-500 text-s italic text-center mt-2">{errorMessage}</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <Button type="header" callback={() => {doRegisterCall()}}>Register</Button>
                        <a onClick={() => {setState({...state, isFullOpen: !state.isFullOpen})}} className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">{state.isFullOpen? "New Register" : "Confirm Register"}</a>
                    </div>
 
                </div>

            </div>
        </div>
    )
}
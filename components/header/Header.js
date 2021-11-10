import React from 'react';
import Button from '../usefull/Button';

export default function Header({isLoggedIn}){
    
    const [loginModalOpen, setLoginModalOpen] = React.useState(false);
    const [registerModalOpen, setRegisterModalOpen] = React.useState(false);


    return(
        <div className="flex h-16 bg-gray-300 justify-between p-4">
            <Logo></Logo>
            
            {isLoggedIn? 
                <Profile />
                :
                <LoginRegister setLoginModalOpen={setLoginModalOpen} setRegisterModalOpen={setRegisterModalOpen}/>
            }

            {loginModalOpen? <LoginModal setModalOpen={setLoginModalOpen} /> : null}
 
            {registerModalOpen? <RegisterModal setModalOpen={setRegisterModalOpen} /> : null}

        </div>
    )
}

const Logo = () => {
    return (
        <p>CC-Games</p>
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

const Profile = () => {
    return (
        <div>
            <p>Profile</p>
        </div>
    )
}

const LoginModal = ({setModalOpen}) => {
    const [errorMessage, setErrorMessage] = React.useState("");
    
    const [state, setState] = React.useState({
        username: "testuser@cc-games.com",
        password: "123456789",
    })

    const modalClickHandler = (event) => {
        const LoginModal = document.getElementById("LoginModal");

        if(!event.nativeEvent.path.includes(LoginModal)){
            setModalOpen(false);
        }
    }

    const doLoginCall = async() => {
        let payload = {
            email: state.username,
            password: state.password
        };

        let response = await fetch('/api/auth/login', {
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        console.log(await (await response.blob()).text());
    }
    
    
    return(
        <div 
            className="w-screen h-screen bg-black bg-opacity-40 absolute top-0 left-0 flex justify-center items-center"
            onClick={(event) => modalClickHandler(event)}
        >
            <div className="bg-white rounded-md" id="LoginModal">

                <div className="w-full bg-red-700 text-center text-white py-1 rounded-t-md shadow-md">
                    <p className="font-bold text-2xl pb-2">Login</p>
                </div>

                <div className="p-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Username</label>
                        <input value={state.username} onChange={(event) => {setState({...state, username: event.target.value})}} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username"></input>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                        <input value={state.password} onChange={(event) => {setState({...state, password: event.target.value})}}  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="Password"></input>
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

const RegisterModal = ({setModalOpen}) => {
    const modalClickHandler = (event) => {
        const LoginModal = document.getElementById("RegisterModal");

        if(!event.nativeEvent.path.includes(LoginModal)){
            setModalOpen(false);
        }
    }
    
    
    return(
        <div 
            className="w-screen h-screen bg-black bg-opacity-40 absolute top-0 left-0 flex justify-center items-center"
            onClick={(event) => modalClickHandler(event)}
        >
            <div className="w-40 h-40 bg-white" id="RegisterModal">

                <div className="w-full bg-red-700 text-center text-white py-1">
                    <p>Register</p>
                </div>

                <div>
                    

 
                </div>

            </div>
        </div>
    )
}
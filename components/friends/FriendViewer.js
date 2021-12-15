import React from 'react';
import Context from '../../res/Context';
import Button from '../usefull/Button';

export default function FriendViewer(){

    const [allFriendsData, setAllFriendsData] = React.useState(null); //After API call => OBJ with key = u_id
    const [socket, setSocket] = React.useState(null);
    
    const [show, setShow] = React.useState(false);
    const [chat, setChat] = React.useState(null); //If null => Show nothing || u_id of the Friend
    
    const [isAddFriendModalOpen, setAddFriendModalOpen] = React.useState(false);

    const {get_socket} = React.useContext(Context);

    React.useEffect(() => {
    
        if(socket == null && get_socket() != null && allFriendsData != null){
            const s = get_socket();
            setSocket(s);

            s.emit('get_all_friends_online_state', Object.keys(allFriendsData), (data) => {
                let allFriends = allFriendsData;
                
                for(let friend of data){
                    allFriends[friend.u_id].logState = friend.state;
                    allFriends[friend.u_id].location = friend.location;
                }

                setAllFriendsData({ ...allFriends});
            });

            s.on('friend_state_change', (newState, friendId) => {
                let allFriends = allFriendsData;
                
                if(newState == "login" || newState == "logout"){
                    allFriends[friendId].logState = newState;

                    if(newState == "login")
                        s.emit("add_to_friends", friendId);
                    
                    if(newState == "logout")
                        delete allFriends[friendId].location;
                } else {
                    console.log("CHANGE LOCATION: " + newState);
                    allFriends[friendId].location = newState;

                    if(newState == "remove_location")
                        delete allFriends[friendId].location;
                }

                setAllFriendsData({...allFriends});
            })
        }    
        
    }, [get_socket(), allFriendsData])

    React.useEffect(() => {
        const getAllFriendsData = async() => {
            let response = await fetch('/api/friend/getAllFriendData');
            response = await response.json();

            if(response.code == 200){
                let allFriends = JSON.parse(response.allFriendData);   
                setAllFriendsData({...allFriends});
                
                if(allFriends && Object.keys(allFriends).length > 0)
                    setShow(true);
                else 
                    setShow(false)
            }
        }

        getAllFriendsData();
    }, [])

    const addFriend = async(data) => {
        let response = await fetch('/api/friend/addFriend', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                friend_id: data,
            })
        });
        
        response = await response.json();

        if(response.code == 200){
            let allFriends = allFriendsData;

            allFriends[response.data.u_id] = {
                username: response.data.username,
                friends: response.data.friends
            }

            setAddFriendModalOpen(false);
            setAllFriendsData(allFriends);
        }
    }

    return(
        <>
            {show? 
                <div className="fixed right-0 top-1/3 bg-red-400 rounded-md  drop-shadow-lg">
                    <h1 className='text-center text-lg py-1 font-bold tracking-wide'>Friends</h1>

                    <p className='absolute right-1 top-0 text-3xl cursor-pointer' onClick={() => setAddFriendModalOpen(true)}>+</p>


                    {allFriendsData != null? 
                        <>
                            <FriendView data={allFriendsData} />
                        
                            {chat != null? <ChatView u_id={chat} data={allFriendsData}/> : null}

                        </>
                    : null}
                </div>
            : null}

            {isAddFriendModalOpen? <AddFriendModal addFriendCallback={addFriend} setModalOpen={setAddFriendModalOpen}/> : null}
        </>
    )
}

const FriendView = ({data}) => {
    return(
        <div>
            {
                Object.keys(data).map((key, index) => {
                    return(
                        <Friend username={data[key].username} logState={data[key].logState} location={data[key].location}/>
                    )
                })
            }    


        </div>
    )
}

/*

{
    Object.keys(data).map((key, index) => {
        return(
            <div key={index}>
                <p className={"font-bold " + (data[key].logState == "login" ? "text-green-500" : "text-white")} >{data[key].username}</p>
            </div>
        )
    })
}


*/

const Friend = (props) => {
    return(
        <div className='flex-1 items-center flex gap-2 bg-white p-2 border-2 border-gray-300 w-52 max-w-xs rounded-md cursor-pointer'>
            <div className='relative'>
                <div className='rounded-full bg-gray-500 w-10 h-10'></div>
                {props.logState=='login'? <div className='rounded-full w-4 h-4 bg-green-400 absolute right-0 top-6'></div> : null}
            </div>

            <div className=''>
                <p className='font-bold text-lg overflow-hidden whitespace-nowrap'>{props.username}</p>
                {props.location? <p className='-mt-2 text-sm text-gray-500'>{props.location}</p> : null}
            </div>

        </div>
    )
}

const ChatView = ({u_id, data}) => {




}

const AddFriendModal = ({setModalOpen, addFriendCallback}) => {

    const [input, setInput] = React.useState("");

    const modalClickHandler = (event) => {
        const AddFriendModal = document.getElementById("AddFriendModal");

        if(!event.nativeEvent.path.includes(AddFriendModal)){
            setModalOpen(false);
        }
    }

    return(
        <div className='w-screen h-screen bg-black bg-opacity-40 absolute top-0 left-0 flex justify-center items-center' onClick={(event) => modalClickHandler(event)}>
        
            <div className='bg-white rounded-md' id="AddFriendModal">
                <div className='w-full bg-red-700 text-center text-white py-1 rounded-t-md shadow-md'>
                    <p className='font-bold text-2xl pb-2'>Add Friend</p>
                </div>

                <div className='p-4'>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="addFriendLabel">Username</label>
                        <input 
                            value={input} 
                            onChange={(event) => {setInput(event.target.value)} } 
                            className={("shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ")} 
                            id="addFriendLabel" 
                            type="text" 
                            placeholder="Username">
                        </input>
                    </div>

                    <div className="flex items-center justify-between">
                        <Button type="header" callback={() => {addFriendCallback(input)}}>Add Friend</Button>
                    </div>
                </div>

            </div>

        </div>
    )
}


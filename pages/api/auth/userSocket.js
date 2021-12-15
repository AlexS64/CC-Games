import StatusCodeMsg from "../../../backend-helper/StatusCodeMsg"
import cookie from 'cookie';
import validateSID from "../../../backend-helper/validateSID";
import { Server } from 'socket.io';
import connectDB from "../../../backend-helper/connectDB";
import dbConfig from "../../../backend-helper/dbConfig";
import queryDB from "../../../backend-helper/queryDB";
import { convertQueryToArray } from "../../../backend-helper/converter";

const ioHandler = async(req, res) => {
    if(!res.socket.server.io){
        const io = new Server(res.socket.server);

        io.on('connection', async socket => {
            const cookies = cookie.parse(socket.request.headers.cookie || "");
            const { u_id } = cookies;

            socket.data.u_id = u_id;
            socket.join(u_id);
            
            console.log("=======================");
            console.log("Socket connected: " + socket.data.u_id.substr(0, 5));

            socket.data.friends = await getAllFriendSockets(io, u_id);          
            sendEventToAllFriends(socket, 'login');
            
            socket.on('get_all_friends_online_state', async (data, cb) => {
                const allSockets = await io.fetchSockets();
                const re = [];

                for(let u_id of data){
                    let isLoggedIn = false;
                    let lobbyId = null
                    for (let socket of allSockets){
                        if(socket.data.u_id == u_id){
                            isLoggedIn = true;
                            lobbyId = socket.data.lobbyId;
                        }
                            
                    }

                    re.push({
                        u_id: u_id,
                        state: (isLoggedIn? 'login': 'logout'),
                        location: (lobbyId != null)? 'In Lobby' : null
                    });
                }

                cb(re);

            });

            socket.on('add_to_friends', friendId => {
                console.log("Trying to add the friend socket")
                getFriendSocket(io, friendId).then(s => {
                    let notConnected = true;
                    for(let friends of socket.data.friends){
                        if(friends.data.u_id == s.data.u_id){
                            notConnected = false;
                        }
                    }

                    if(notConnected){
                        socket.data.friends.push(s);
                        console.log("added: " + s.data.u_id.substr(0, 5) + " to friendslist of: " + socket.data.u_id.substr(0, 5));
                    }
                });
            })

            socket.on('add_new_friend', async (friendId) => { 
                let friendSocket = await getFriendSocket(friendId);
                socket.data.friends.push(friendSocket);
            });

            socket.on("remove_friend", (friendId) => {
                let friendSockets = socket.data.friends;

                friendSockets = friendSockets.filter(fs => fs.data.u_id != friendId);
                socket.data.friends = friendSockets;
            });
 
            socket.on('message_to_friend', (message, friendId) => {
                console.log("Sending Message: " + message + " to: " + friendId);
                socket.to(friendId).emit('message_from_friend', message);
            });

            socket.on('message_to_lobby', (message) => {
                if(socket.data.lobbyId != null){
                    socket.to(socket.data.lobbyId).emit('message_from_lobby', message);
                }
            })

            socket.on('join_lobby', (lobbyId) => {
                console.log("Socket joning Lobby: " + lobbyId);
                socket.join(lobbyId);
                socket.data.lobbyId = lobbyId;

                sendEventToAllFriends(socket, 'In Lobby');
                console.log("Socket Friends: " + socket.data.friends.length);
            })

            socket.on('leave_lobby', () => {
                console.log("Socket leaving Lobby: " + socket.data.lobbyId);
                if(socket.data.lobbyId != null){
                    socket.leave(socket.data.lobbyId);
                    socket.data.lobbyId = null;
                }

                sendEventToAllFriends(socket, 'remove_location')
            });

            socket.on('logout', async () => {    
                socket.disconnect();
            });

            socket.on('disconnecting', () => {
                console.log("Socket is about to disconnect");
                sendEventToAllFriends(socket, 'logout');                
            })
            
        });

        res.socket.server.io = io;
    } else {
        console.log("Socket already running, reconnecting ...");
    }

    res.status(200).json({
        code: 200,
        msg: StatusCodeMsg(200)
    })
}

const getFriendSocket = async (io, friendId) => {
    const allSockets = await io.fetchSockets();

    for(let socket of allSockets){
        if(socket.data.u_id == friendId){
            return socket;
        }
    }
}

const getAllFriendSockets = async (io, userId) => {
    //Get all Friends
    const con = await connectDB(dbConfig).catch(e => {console.log(e) });
    let allFriends = await queryDB(con, "SELECT friends FROM `cc-games`.users WHERE u_id=\"" + userId + "\"").catch(e => { console.log(e) });
    allFriends = JSON.parse(allFriends[0].friends);

    if(!allFriends || allFriends.length == 0){
        return [];
    }

    const allSockets = await io.fetchSockets();
    let returnArray = [];

    for(let friendObj of allFriends){
        for(let socket of allSockets){
            if(socket.data.u_id == friendObj){
                returnArray.push(socket);
            }
        }
    }

    return returnArray;
}

const sendEventToAllFriends = (socket, eventType) => {
    for(let friend of socket.data.friends){
        console.log("SENDING " + eventType + " to Friend: " + friend.data.u_id);
        friend.emit('friend_state_change', eventType, socket.data.u_id);
    }

    
}


export default ioHandler;
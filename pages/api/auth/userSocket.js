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

            socket.data.friends = await getAllFriendSockets(io, u_id);          
            sendEventToAllFriends(socket, 'login');

            console.log("Socket connected: " + socket.data.u_id);

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
            })

            socket.on('leave_lobby', () => {
                console.log("Socket leaving Lobby: " + socket.data.lobbyId);
                if(socket.data.lobbyId != null){
                    socket.leave(socket.data.lobbyId);
                    socket.data.lobbyId = null;
                }
            });

            socket.on('logout', async () => {    
                socket.disconnect();
            });

            socket.on('disconnecting', () => {
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

const getAllFriendSockets = async (io, userId) => {
    //Get all Friends
    const con = await connectDB(dbConfig).catch(e => {console.log(e) });
    let allFriends = await queryDB(con, "SELECT friends FROM `cc-games`.users WHERE u_id=\"" + userId + "\"").catch(e => { console.log(e) });
    allFriends = JSON.parse(allFriends[0].friends);

    const allSockets = await io.fetchSockets();
    let returnArray = [];

    for(let friendObj of allFriends){
        for(let socket of allSockets){
            if(socket.data.u_id == friendObj.u_id){
                returnArray.push(socket);
            }
        }
    }

    return returnArray;
}

const sendEventToAllFriends = (socket, eventType) => {
    for(let friend of socket.data.friends){
        friend.emit('friend_state_change', eventType, socket.data.u_id);
    }
}


export default ioHandler;
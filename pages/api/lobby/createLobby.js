import connectDB from "../../../backend-helper/connectDB";
import queryDB from "../../../backend-helper/queryDB";
import dbConfig from "../../../backend-helper/dbConfig";
import validateSID from "../../../backend-helper/validateSID";
import StatusCodeMsg from "../../../backend-helper/StatusCodeMsg";
import { createLobbyCode, createLobbyId } from "../../../backend-helper/generateCodes";
import cookie from 'cookie';

const { randomBytes } = require('crypto');

export default async function createLobby(req, res) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const { s_id, u_id } = cookies;

    if(!s_id || !u_id){
        res.status(200).json({
            code: 300,
            msg: StatusCodeMsg(300)
        });
        return;
    }
    
    let isValid = await validateSID(s_id, u_id);

    if(!isValid){
        res.status(200).json({
            code: 306,
            msg: StatusCodeMsg(306)
        })
        return;
    }
    
    const con = await connectDB(dbConfig);

    let lobbyId = await createLobbyId(con);
    let lobbyCode = await createLobbyCode(con);
    let users = {
        allUsers: [
            u_id,
        ]
    }
    let privacy = 0;

    const insert = await queryDB(con, "INSERT INTO `cc-games`.lobbys (lobbyId, lobbyCreator, lobbyLeader, lobbyCode, privacy, users) VALUES ('" + lobbyId + "', '" + u_id + "', '" + u_id + "' , '" + lobbyCode + "', '" + privacy + "', '" + JSON.stringify(users) + "' )").catch(e => { console.log(e)});

    if(insert.affectedRows == 1){
        res.status(200).json({
            code: 200,
            msg: StatusCodeMsg(200),
            lobbyCode: lobbyCode,
        })
        return;
    }

    res.status(200).json({
        code: 305,
        msg: StatusCodeMsg(305)
    })
    return;    
}



/*
What does a Lobby Need:

Lobby ID,
Lobby Creator,
Lobby Leader (by default Lobby Creator, else Random Person),
Max Size (dynamic)
Lobby Code, (to join)
Privacy (0 = Public, 1 = Friends Only, 2 = Invites Only)



*/

import connectDB from "../../../backend-helper/connectDB";
import queryDB from "../../../backend-helper/queryDB";
import dbConfig from "../../../backend-helper/dbConfig";
import validateSID from "../../../backend-helper/validateSID";
import { convertQueryToArray } from "../../../backend-helper/converter";
import StatusCodeMsg from "../../../backend-helper/StatusCodeMsg";

const { randomBytes } = require('crypto');

export default async function createLobby(req, res) {
    if(req.method == "POST"){
        //Get Data
        console.log(req.headers.cookie);
        let sid = req.headers.cookie.split("=")[1];
        console.log(sid);

        const { email } = req.body;

        //Validate
        if(await validateSID(sid) != email){
            res.status(200).json({
                code: 306,
                msg: StatusCodeMsg(306)
            })
            return;
        }

       //Create Lobby
       
       const con = await connectDB(dbConfig);

        let lobbyId = await createLobbyId(con);
        let users = {
            allUsers: [
                u_id,
            ]
        }
        let privacy = 0;

        const insert = await queryDB(con, "INSERT INTO `cc-games`.lobbys (lobbyId, lobbyCreator, lobbyLeader, privacy, users) VALUES ('" + lobbyId + "', '" + u_id + "', '" + u_id + "' , '" + privacy + "', '" + JSON.stringify(users) + "' )").catch(e => { console.log(e)});
        
        if(insert.affectedRows == 1){
            res.status(200).json({
                code: 200,
                msg: StatusCodeMsg(200),
                lobbyId: lobbyId,
            })
            return;
        }
 
        res.status(200).json({
            code: 305,
            msg: StatusCodeMsg(305)
        })
        return;
        
    } else {
        
        res.status(200).json({
            code: 400,
            msg: StatusCodeMsg(400)
        })
    }
}

//Create a Unique Lobby ID
async function createLobbyId(con){
    const query = convertQueryToArray(await queryDB(con, "SELECT lobbyId FROM `cc-games`.lobbys").catch(e => {console.log(e)}), ["lobbyId"]);
    let lobbyId = randomBytes(60).toString('hex').substr(0, 20);
    
    while(query.includes(lobbyId)){    
        lobbyId = randomBytes(60).toString('hex').substr(0, 20);
    }

    return lobbyId;
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

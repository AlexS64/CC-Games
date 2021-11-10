import connectDB from "../../../backend-helper/connectDB";
import queryDB from "../../../backend-helper/queryDB";
import dbConfig from "../../../backend-helper/dbConfig";
import validateSID from "../../../backend-helper/validateSID";

const { randomBytes } = require('crypto');

export default async function createLobby(req, res) {
    if(req.method == "POST"){
        //Get Data
        //let sid = req.headers.cookie.split("=")[1];
        //console.log(sid);

        const { email, u_id } = req.body;

        //Validate
        /*
        if(validateSID(sid) != email){
            res.send("Invalid SID");
            return;
        }
        */

        //Create Lobby
        let lobbyId = createLobbyId();
        let users = {
            allUsers: [
                u_id,
            ]
        }
        let privacy = 0;

        const con = await connectDB(dbConfig);
        const insert = await queryDB(con, "INSERT INTO `cc-games`.lobbys (lobbyId, lobbyCreator, lobbyLeader, privacy, users) VALUES ('" + lobbyId + "', '" + u_id + "', '" + u_id + "' , '" + privacy + "', '" + JSON.stringify(users) + "' )").catch(e => { console.log(e)});

        if(insert.affectedRows == 1){
            res.send(lobbyId);
            return;
        }

        res.send("Something went wrong");
        return;
        
    }
}

function createLobbyId(){
    let lobbyId = randomBytes(60).toString('hex').substr(0, 20);
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

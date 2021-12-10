import { convertQueryToArray } from "./converter";
import queryDB from "./queryDB";
const {randomBytes } = require('crypto');

export async function createUserId(con){
    const query = convertQueryToArray(await(queryDB(con, "SELECT u_id FROM `cc-games`.users WHERE u_id IS NOT NULL").catch(e => {console.log(e)})), ["u_id"]);
    let userId = randomBytes(60).toString('hex').substr(0, 45);

    while(query.includes(userId)){
        userId = randomBytes(60).toString('hex').substr(0, 45);
    }

    return userId;
}

export async function createSessionId(con){
    const query = convertQueryToArray(await queryDB(con, "SELECT session FROM `cc-games`.auth WHERE session IS NOT NULL"), ["session"]);
    let sessionId = randomBytes(60).toString('hex');

    while(query.includes(sessionId)){
        lobbyId = randomBytes(60).toString('hex');
    }
 
    return sessionId;
}

//Create a Unique Lobby ID
export async function createLobbyId(con){
    const query = convertQueryToArray(await queryDB(con, "SELECT lobbyId FROM `cc-games`.lobbys").catch(e => {console.log(e)}), ["lobbyId"]);
    let lobbyId = randomBytes(60).toString('hex').substr(0, 20);
    
    while(query.includes(lobbyId)){    
        lobbyId = randomBytes(60).toString('hex').substr(0, 20);
    }

    return lobbyId;
}

export async function createLobbyCode(con){
    const query = convertQueryToArray(await queryDB(con, "SELECT lobbyCode FROM `cc-games`.lobbys").catch(e => {console.log(e)}), ["lobbyCode"]);
    let lobbyCode = generate6DigitLobbyCode();

    while(query.includes(lobbyCode)){
        lobbyCode = generate6DigitLobbyCode();
    }

    return lobbyCode;
}

function generate6DigitLobbyCode(){
    let allDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let reString = "";

    for(let i = 0; i < 6; i++){
        reString += allDigits[parseInt(Math.random() * allDigits.length)];
    }
    
    console.log(reString);
    return reString;
}
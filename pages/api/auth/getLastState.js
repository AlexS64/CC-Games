
import cookie from 'cookie';
import connectDB from '../../../backend-helper/connectDB';
import { convertQueryToArray } from '../../../backend-helper/converter';
import dbConfig from '../../../backend-helper/dbConfig';
import queryDB from '../../../backend-helper/queryDB';
import StatusCodeMsg from '../../../backend-helper/StatusCodeMsg';
import validateSID from '../../../backend-helper/validateSID';


export default async function getLastState(req, res){
    const cookies = cookie.parse(req.headers.cookie || "");
    const { u_id, s_id } = cookies;

    if(!u_id || !s_id || !await validateSID(s_id, u_id)){
        res.status(200).json({
            code: 306,
            msg: StatusCodeMsg(306)
        });
        return;
    } 

    //Check if user is registered in a Lobby
    const con = await connectDB(dbConfig).catch(e => { console.log(e) });
    const query = await queryDB(con, "SELECT * FROM `cc-games`.lobbys").catch(e => { console.log(e) });

    for(let row of query){
        let allUsers = JSON.parse(row.users).allUsers;
        
        for(let userId of allUsers){
            if(userId == u_id){
                res.status(200).json({
                    code: 200,
                    msg: StatusCodeMsg(200),
                    lastState: 'in_lobby',
                    data: row.lobbyCode
                });
                return;
            }
        }
    }
    

    //Check if user is ingame

    res.status(200).json({
        code: 200,
        msg: StatusCodeMsg(200)
    })


}
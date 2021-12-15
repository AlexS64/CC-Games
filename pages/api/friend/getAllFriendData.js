 import cookie from 'cookie';
import connectDB from '../../../backend-helper/connectDB';
import { convertQueryToArray } from '../../../backend-helper/converter';
import dbConfig from '../../../backend-helper/dbConfig';
import queryDB from '../../../backend-helper/queryDB';
import StatusCodeMsg from '../../../backend-helper/StatusCodeMsg';
import validateSID from '../../../backend-helper/validateSID';

export default async function getAllFriendData(req, res){
    const cookies = cookie.parse(req.headers.cookie || "");
    const {s_id, u_id} = cookies;
    
    if(!s_id || !u_id || !await validateSID(s_id, u_id)){
        res.status(401).json({
            code: 306,
            msg: StatusCodeMsg(306)
        });
        return;
    }

    const con = await connectDB(dbConfig).catch(e => { console.log(e) });
    let allFriends = await queryDB(con, "SELECT friends FROM `cc-games`.users WHERE u_id=\"" + u_id + "\"").catch(e => { console.log(e) });
    allFriends = JSON.parse(allFriends[0].friends);

    if(!allFriends || allFriends.length == 0){
        res.status(200).json({
            code: 200,
            msg: StatusCodeMsg(200),
            allFriendData: JSON.stringify({})
        });
        return;
    }

    let re = {};

    for(let friend_id of allFriends){
        const query = await queryDB(con, "SELECT * FROM `cc-games`.users WHERE u_id=\"" + friend_id + "\"").catch(e => {console.log(e)});

        if(query.length == 1){
            re[friend_id] = {
                username: query[0].username,
                friends: JSON.parse(query[0].friends)
            }
        }
    }
    con.end();

    res.status(200).json({
        code: 200,
        msg: StatusCodeMsg(200),
        allFriendData: JSON.stringify(re),
    });
}
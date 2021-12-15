import cookie from 'cookie';
import connectDB from '../../../backend-helper/connectDB';
import dbConfig from '../../../backend-helper/dbConfig';
import queryDB from '../../../backend-helper/queryDB';

import StatusCodeMsg from "../../../backend-helper/StatusCodeMsg";
import validateSID from '../../../backend-helper/validateSID';


export default async function getSingleFriendData(req, res){
    if(req.method == "POST"){
        const cookies = cookie.parse(req.headers.cookie || "");
        const { s_id, u_id } = cookies;
        const {friend_id} = req.body;

        if(!s_id || !u_id || !await validateSID(s_id, u_id)){
            res.status(401).json({
                code: 306,
                msg: StatusCodeMsg(306)
            });
            return;
        }

        if(!friend_id){
            res.status(200).json({
                code: 300,
                msg: StatusCodeMsg(300)
            });
            return;
        }

        const con = await connectDB(dbConfig).catch(e => { console.log(e) });
        const query = await queryDB(con, "SELECT * FROM `cc-games`.users WHERE u_id=\"" + friend_id + "\"").catch(e => { console.log(e) });
        con.end();

        if(query.length == 1){
            res.status(200).json({
                code: 200,
                msg: StatusCodeMsg(200),
                friend_id: friend_id,
                friend_username = query[0].username,
                friend_friends = JSON.parse(query[0].friends),
            });
            return;
        }

        res.status(200).json({
            code: 400,
            msg: StatusCodeMsg(400),
        });
        return;
    }

    res.status(200).json({
        code: 400,
        msg: StatusCodeMsg(400),
    })
}
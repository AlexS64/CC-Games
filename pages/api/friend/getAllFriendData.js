import cookie from 'cookie';
import connectDB from '../../../backend-helper/connectDB';
import dbConfig from '../../../backend-helper/dbConfig';
import queryDB from '../../../backend-helper/queryDB';
import StatusCodeMsg from '../../../backend-helper/StatusCodeMsg';
import validateSID from '../../../backend-helper/validateSID';

export default async function getAllFriendData(req, res){
    if(req.method == "POST"){
        const cookies = cookie.parse(req.headers.cookie || "");
        const {s_id, u_id} = cookies;
        const {friend_ids} = req.body;

        if(!s_id || !u_id || !await validateSID(s_id, u_id)){
            res.status(401).json({
                code: 306,
                msg: StatusCodeMsg(306)
            });
            return;
        }

        if(!friend_ids){
            res.status(200).json({
                code: 300,
                msg: StatusCodeMsg(300)
            });
            return;
        }

        const con = await connectDB(dbConfig).catch(e => { console.log(e) });
        let re = [];

        for(let friend_id of friend_ids){
            const query = await queryDB(con, "SELECT * FROM `cc-games`.users WHERE u_id=\"" + friend_id + "\"").catch(e => {console.log(e)});

            if(query.length == 1){
                re.push({
                    u_id: friend_id,
                    username: query[0].username,
                    friends: JSON.parse(query[0].friends),
                });
            } else {
                re.push(null);
            }
        }

        res.status(200).json({
            code: 200,
            msg: StatusCodeMsg(200),
            allFriendData: JSON.stringify(re),
        });
        return;
    }

    res.status(200).json({
        code: 400,
        msg: StatusCodeMsg(400),
    });
}

import cookie from 'cookie';
import connectDB from '../../../backend-helper/connectDB';
import queryDB from '../../../backend-helper/queryDB';
import dbConfig from '../../../backend-helper/dbConfig';
import StatusCodeMsg from '../../../backend-helper/StatusCodeMsg';
import validateSID from '../../../backend-helper/validateSID';

export default async function addFriend(req, res){
    if(req.method == "POST"){
        const cookies = cookie.parse(req.headers.cookie || "");
        const { s_id, u_id} = cookies;
        const { friend_id } = req.body;

        if(!s_id || !u_id || !await validateSID(s_id, u_id)){
            res.status(401).json({
                code: 306,
                msg: StatusCodeMsg(306)
            })
        }

        if(!friend_id){
            res.status(200).json({
                code: 300,
                msg: StatusCodeMsg(300)
            });
        }
        
        const con = await connectDB(dbConfig).catch(e => { console.log(e) });
        const query = await queryDB(con, "SELECT * FROM `cc-games`.users WHERE u_id=\"" + u_id + "\"").catch(e => { console.log(e) });

        //Update Friends Data
        let allFriends = JSON.parse(query[0].friends);
        
        //Check if Friend is already in that List
        for(let friendObj of allFriends){
            if(friendObj.u_id == friend_id){
                res.status(200).json({
                    code: 201,
                    msg: StatusCodeMsg(200)
                });
                return;
            }
        }
        
        //Add a new Friend Object to the list
        allFriends.push(friend_id);

        const update = await queryDB(con, "UPDATE `cc-games`.users SET friends=\'" + JSON.stringify(allFriends) + "\' WHERE u_id=\"" + u_id + "\"").catch(e => { console.log(e) });
        const query2 = await queryDB(con, "SELECT * FROM `cc-games`.users WHERE u_id=\"" + friend_id + "\"").catch(e => { console.log(e) });
        con.end();

        if(update.affectedRows == 1){
            res.status(200).json({
                code: 200,
                msg: StatusCodeMsg(200),
                data: {
                    username: query2[0].username,
                    friends: JSON.parse(query2[0].friends),
                    u_id: friend_id
                }
            });
            return;
        } 

        res.status(200).json({
            code: 500,
            msg: StatusCodeMsg(500)
        });
        return;
    }

    res.status(200).json({
        code: 400,
        msg: StatusCodeMsg(400),
    });
    
}
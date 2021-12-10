import connectDB from "../../../backend-helper/connectDB";
import dbConfig from "../../../backend-helper/dbConfig";
import queryDB from "../../../backend-helper/queryDB";
import StatusCodeMsg from "../../../backend-helper/StatusCodeMsg";
import validateSID from "../../../backend-helper/validateSID";
import cookie from 'cookie';

export default async function canJoinLobby(req, res) {
    if(req.method == "POST"){
        const cookies = cookie.parse(req.headers.cookie || '');
        const { s_id, u_id } = cookies;

        const { lobbyCode } = req.body;

        let isValid = await validateSID(s_id, u_id);
        
        if(!isValid){
            res.status(200).json({
                code: 306,
                msg: StatusCodeMsg(306)
            })
        }

        const con = await connectDB(dbConfig).catch(e => { console.log(e) });
        const query = await queryDB(con, "SELECT * FROM `cc-games`.lobbys WHERE lobbyCode=\"" + lobbyCode + "\"").catch(e => { console.log(e) });

        if(query.length == 1){
            if(query[0].privacy == 0){
                res.status(200).json({
                    code: 200,
                    msg: StatusCodeMsg(200)
                });
                return
            }

            if(query[0].privacy == 1 && isFriend(query[0].lobbyCreator, u_id)){
                res.status(200).json({
                    code: 200,
                    msg: StatusCodeMsg(200)
                })
            } else {
                res.status(200).json({
                    code: 311,
                    msg: StatusCodeMsg(311)
                })
            }

            if(query[0].privacy == 2 && isInvited(query[0].invites, u_id)){
                res.status(200).json({
                    code: 200,
                    msg: StatusCodeMsg(200)
                });
            } else {
                res.status(200).json({
                    code: 311,
                    msg: StatusCodeMsg(311)
                })
            }
        } else {
            //Lobby does not exist
            res.status(200).json({
                code: 310,
                msg: StatusCodeMsg(310)
            })
        }


    } else {
        res.status(200).json({
            code: 400,
            msg: StatusCodeMsg(400)
        })
    }
}

function isFriend(creatorId, joinId){
    //TODO: Implement
    return true;
}

function isInvited(invites, joinId){
    //TODO: Implement
    return true;
}
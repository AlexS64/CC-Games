
import cookie from 'cookie';
import connectDB from '../../../backend-helper/connectDB';
import dbConfig from '../../../backend-helper/dbConfig';
import queryDB from '../../../backend-helper/queryDB';
import StatusCodeMsg from '../../../backend-helper/StatusCodeMsg';
import validateSID from '../../../backend-helper/validateSID';

export default async function leaveLobby(req, res){
    if(req.method == "POST"){
        
        let cookies = cookie.parse(req.headers.cookie || "");
        let {s_id, u_id} = cookies;
        let { lobbyCode } = req.body;

        if(!s_id || !u_id || !lobbyCode){
            res.status(200).json({
                code: 305,
                msg: StatusCodeMsg(305)
            });
            return;
        }

        let isValid = await validateSID(s_id, u_id);

        if(!isValid){
            res.status(200).json({
                code: 306,
                msg: StatusCodeMsg(306)
            });
            return;
        }

        const con = await connectDB(dbConfig).catch(e => {console.log(e)});
        const query = await queryDB(con, "SELECT * FROM `cc-games`.lobbys WHERE lobbyCode=\"" + lobbyCode + "\"").catch(e => {console.log(e)});

        if(query.length == 1){
            let users = JSON.parse(query[0].users);
            let index = users.allUsers.indexOf(u_id);

            if(index == -1)
                console.log(allUsers);
            else
                users.allUsers.splice(index, 1)
            
            //If lobbySize == 0 => Destroy Lobby
            if(users.allUsers.length == 0){
                const del = await queryDB(con, "DELETE FROM `cc-games`.lobbys WHERE lobbyId=\"" + query[0].lobbyId + "\"").catch(e => {console.log(e)});

                if(del.affectedRows == 1){
                    res.status(200).json({
                        code: 200,
                        msg: StatusCodeMsg(200)
                    })
                    return;
                }

                res.status(200).json({
                    code: 500,
                    msg: StatusCodeMsg(500)
                })
            
                return;
            }

            const update = await queryDB(con, "UPDATE `cc-games`.lobbys SET users=\'" + JSON.stringify(users) + "\' WHERE lobbyCode=\"" + lobbyCode + "\"").catch(e => {console.log(e)});

            if(update.affectedRows == 1){
                res.status(200).json({
                    code: 200,
                    msg: StatusCodeMsg(200)
                })
                return;
            } 
            
            res.status(200).json({
                code: 500,
                msg: StatusCodeMsg(500)
            })
            
        } else {
            //Lobby not exsitend
            res.status(200).json({
                code: 310,
                msg: StatusCodeMsg(310)
            });
            return;
        }
    } else {
        res.status(200).json({
            code: 400,
            msg: StatusCodeMsg(400)
        });
        return;
    }
}
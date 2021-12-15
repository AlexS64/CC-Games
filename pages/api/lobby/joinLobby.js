import StatusCodeMsg from "../../../backend-helper/StatusCodeMsg";
import cookie from 'cookie';
import validateSID from "../../../backend-helper/validateSID";
import connectDB from "../../../backend-helper/connectDB";
import dbConfig from "../../../backend-helper/dbConfig";
import queryDB from "../../../backend-helper/queryDB";

export default async function joinLobby(req, res){
    if(req.method == "POST"){
        const cookies = cookie.parse(req.headers.cookie || "");
        const { s_id, u_id } = cookies;

        const { lobbyCode } = req.body;

        if(!s_id || ! u_id || !lobbyCode){
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

        const con = await connectDB(dbConfig).catch(e => {console.log(3)});
        const query = await queryDB(con, "SELECT * FROM `cc-games`.lobbys WHERE lobbyCode=\"" + lobbyCode + "\"").catch(e => {console.log(e)});

        if(query.length == 1){
            
            
            let users = JSON.parse(query[0].users);
            

            if(!users.allUsers.includes(u_id)){
                users.allUsers.push(u_id);

                //Update DB
                const update = await queryDB(con, "UPDATE `cc-games`.lobbys SET users=\'" + JSON.stringify(users) + "\' WHERE lobbyCode = \"" + lobbyCode + "\"" ).catch(e => {console.log(e)});
                con.end();

                if(update.affectedRows == 1){
                    
                    res.status(200).json({
                        code: 200,
                        msg: StatusCodeMsg(200),
                        lobbyCode: lobbyCode
                    });
                } else {
                    res.status(200).json({
                        code: 500,
                        msg: StatusCodeMsg(500)
                    });
                }

            } else {
                //Already joined Lobby
                res.status(200).json({
                    code: 200,
                    msg: StatusCodeMsg(200),
                    lobbyCode: lobbyCode
                })
            }
        } else {
            //Lobby not found
            res.status(200).json({
                code: 310,
                msg: StatusCodeMsg(310)
            });
        }
    } else {
        res.status(200).json({
            code: 400,
            msg: StatusCodeMsg(400)
        })
    }
}
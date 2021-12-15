import connectDB from "../../../backend-helper/connectDB";
import dbConfig from "../../../backend-helper/dbConfig";
import queryDB from "../../../backend-helper/queryDB";
import StatusCodeMsg from "../../../backend-helper/StatusCodeMsg";
import validateSID from "../../../backend-helper/validateSID";
import cookie from 'cookie';


export default async function logout(req, res){
    const cookies = cookie.parse(req.headers.cookie || '');
    const { s_id, u_id} = cookies;
    
    if(!s_id || !u_id){
        res.status(200).json({
            code: 300,
            msg: StatusCodeMsg(300)
        });
        return;
    }

    let isValid = await validateSID(s_id, u_id);

    if(!isValid){
        if(req.socket){
            console.log(req.socket);
        }

        if(res.socket){
            console.log(res.socket);
        }


        res.status(200).json({
            code: 306,
            msg: StatusCodeMsg(306)
        });
        return;
    }

    //Do the Logout
    const con = await connectDB(dbConfig).catch(e => { console.log(e)});
    const update = await queryDB(con, "UPDATE `cc-games`.auth SET session = null, lastLogin = null WHERE email=\"" + isValid + "\"").catch(e => { console.log(e)})
    
    con.end();

    if(update.affectedRows == 1){
        //Remove Cookie
        res.setHeader('Set-Cookie', [
            cookie.serialize('s_id', null, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== "development",
                maxAge: 0,
                sameSite: 'strict',
                path: "/"
            }),
            cookie.serialize('u_id', null, {
                httpOnly: false,
                secure: process.env.NODE_ENV !== "development",
                maxAge: 0,
                sameSite: 'strict',
                path: "/"
            }),
        ]);
        
        res.status(200).json({
            code: 200,
            msg: StatusCodeMsg(200)
        });
        return;
    }
    
    res.status(200).json({
        code: 305,
        msg: StatusCodeMsg(305)
    });
}
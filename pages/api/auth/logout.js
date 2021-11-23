import connectDB from "../../../backend-helper/connectDB";
import dbConfig from "../../../backend-helper/dbConfig";
import queryDB from "../../../backend-helper/queryDB";
import StatusCodeMsg from "../../../backend-helper/StatusCodeMsg";
import validateSID from "../../../backend-helper/validateSID";
import cookie from 'cookie';


export default async function logout(req, res){
    if(req.method == "POST"){
        
        const { email } = req.body;
        let sid = req.headers.cookie?.split("=")[1];

        if(!email || !sid){
            res.status(200).json({
                code: 300,
                msg: StatusCodeMsg(300)
            });
            return;
        }

        if(await validateSID(sid) != email){
            res.status(200).json({
                code: 305,
                msg: StatusCodeMsg(305)
            });
            return;
        }

        //Do the Logout
        const con = await connectDB(dbConfig).catch(e => { console.log(e)});
        const update = await queryDB(con, "UPDATE `cc-games`.auth SET session = null, lastLogin = null WHERE email=\"" + email + "\"").catch(e => { console.log(e)})

        if(update.affectedRows == 1){
            //Remove Cookie
            res.setHeader('Set-Cookie', cookie.serialize('s_id', null, {
                httpOnly: false,
                secure: process.env.NODE_ENV !== "development",
                maxAge: 0,
                sameSite: 'strict',
                path: "/"
            }));
            
            res.status(200).json({
                code: 200,
                msg: StatusCodeMsg(200)
            });
            return;
        }

        res.status(200).json({
            code: 305,
            msg: StatusCodeMsg(305)
        })

    } else {
        res.status(200).json({
            code: 400,
            msg: StatusCodeMsg(400)
        })
    }
}
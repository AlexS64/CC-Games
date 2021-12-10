import connectDB from "../../../backend-helper/connectDB";
import dbConfig, { user } from "../../../backend-helper/dbConfig";
import queryDB from "../../../backend-helper/queryDB";

import cookie from 'cookie';
import StatusCodeMsg from "../../../backend-helper/StatusCodeMsg";
import { createSessionId } from "../../../backend-helper/generateCodes";

const { scryptSync, randomBytes, timingSafeEqual } = require('crypto');

export default async function login(req, res) {
    if(req.method == "POST"){
        const { email, password } = req.body;

        if(!email || !password){
            res.status(200).json({
                code: "300",
                msg: StatusCodeMsg(300)
            })
            return;   
        }

        const con = await connectDB(dbConfig).catch(e => { console.log(e)});
        const query = await queryDB(con, "SELECT * FROM `cc-games`.auth WHERE email=\"" + email + "\"").catch(e => {console.log(e)});

        if(query.length == 1){
            const [salt, key] = query[0].password.split(":");
            const hashedBuffer = scryptSync(password, salt, 64);

            const keyBuffer = Buffer.from(key, 'hex');
            const match = timingSafeEqual(hashedBuffer, keyBuffer);

            if(match){
                const sessionId = await createSessionId(con);
                const update = await queryDB(con, "UPDATE `cc-games`.auth SET session=\"" + sessionId + "\" WHERE email=\"" + email + "\"").catch(e => {console.log(e)});
                let userId = await queryDB(con, "SELECT u_id FROM `cc-games`.users WHERE email=\"" + email + "\"").catch(e => {console.log(e)});
                userId = userId[0].u_id;

                res.setHeader('Set-Cookie', [
                    cookie.serialize('s_id', sessionId, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV !== "development",
                        maxAge: 3600,
                        sameSite: 'strict',
                        path: "/",
                    })
                    ,
                    cookie.serialize('u_id', userId, {
                        httpOnly: false,
                        secure: process.env.NODE_ENV !== "development",
                        maxAge: 3600,
                        sameSite: 'strict',
                        path: "/"
                    })
                ]);
                
                res.status(200).json({
                    code: 200,
                    msg: StatusCodeMsg(200),
                    email: email,
                });
                return;
            }

            res.status(200).json({
                code: 305,
                msg: StatusCodeMsg(305)
            })
            return;
        }

        res.status(200).json({
            code: 305,
            msg: StatusCodeMsg(305)
        });
        return;
        
    } else {
        res.status(200).json({
            code: 400,
            msg: StatusCodeMsg(400)
        })
    }
}
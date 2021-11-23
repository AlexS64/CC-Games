import connectDB from "../../../backend-helper/connectDB";
import dbConfig from "../../../backend-helper/dbConfig";
import queryDB from "../../../backend-helper/queryDB";
import StatusCodeMsg from "../../../backend-helper/StatusCodeMsg";
import cookie from 'cookie';

const { scryptSync, randomBytes, timingSafeEqual } = require('crypto');

export default async function confirm(req, res){
    if(req.method == "POST"){
        const { email, code, password, passwordConfirm } = req.body;

        if(!email || !code || !password || !passwordConfirm){
            res.status(200).json({
                code: 300,
                msg: StatusCodeMsg(300)
            })
            return;
        }

        if(password != passwordConfirm){
            res.status(200).json({
                code: 305, 
                msg: StatusCodeMsg(305)
            })
            return;
        }

        //Check if we got that user with that code
        const con = await connectDB(dbConfig).catch(e => {console.log(e)});
        const query = await queryDB(con, "SELECT * FROM `cc-games`.auth WHERE email = \"" + email + "\" AND code=\"" + code + "\"").catch(e => {console.log(e)});

        if(query.length == 1){
            //Hash password
            let hashedPassword = hashPassword(password);
            const sessionId = randomBytes(60).toString('hex');

            //Save that to DB
            const update = await queryDB(con, "UPDATE `cc-games`.auth SET password = \"" + hashedPassword + "\" , session=\"" + sessionId + "\" , code = null WHERE email = \"" + email + "\"").catch(e => {console.log(e)});
            if(update.affectedRows == 1){
                res.setHeader('Set-Cookie', cookie.serialize('s_id', sessionId, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV !== "development",
                    maxAge: 3600,
                    sameSite: 'strict',
                    path: "/"
                }));
                
                res.status(200).json({
                    code: 200,
                    msg: StatusCodeMsg(200),
                    email: email
                })
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
        })
        return;
    } else {
        res.status(200).json({
            code: 400,
            msg: StatusCodeMsg(400)
        })
    }
}

function hashPassword(password){
    const salt = randomBytes(16).toString("hex");
    const hashedPassword = scryptSync(password, salt, 64).toString('hex');

    return "" + salt + ":" + hashedPassword;
}
import connectDB from "../../../backend-helper/connectDB";
import dbConfig from "../../../backend-helper/dbConfig";
import queryDB from "../../../backend-helper/queryDB";

import cookie from 'cookie';

const { scryptSync, randomBytes, timingSafeEqual } = require('crypto');

export default async function login(req, res) {
    if(req.method == "POST"){
        const { email, password } = req.body;

        if(!email || !password){
            res.send("Incomplete call");
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
                const sessionId = randomBytes(60).toString('hex');
                const update = await queryDB(con, "UPDATE `cc-games`.auth SET session=\"" + sessionId + "\" WHERE email=\"" + email + "\"").catch(e => {console.log(e)});
 
                res.setHeader('Set-Cookie', cookie.serialize('s_id', sessionId, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV !== "development",
                    maxAge: 3600,
                    sameSite: 'strict',
                    path: "/",
                }));



                res.send("Login successfull: " + sessionId);
                return;
            }

            res.send("Pasword does not match");
            return;
        }

        res.send("User not found");
        return;
        
    }
}
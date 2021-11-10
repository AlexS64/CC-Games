import connectDB from "../../../backend-helper/connectDB";
import dbConfig from "../../../backend-helper/dbConfig";
import queryDB from "../../../backend-helper/queryDB";

const { scryptSync, randomBytes, timingSafeEqual } = require('crypto');

export default async function confirm(req, res){
    if(req.method == "POST"){
        const { email, code, password, passwordConfirm } = req.body;

        if(!email || !code || !password || !passwordConfirm){
            res.send("Incomplete Call. Nothing changed");
            return;
        }

        if(password != passwordConfirm){
            res.send("Passwords do not match! Nothing changed");
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
                res.send("Success: " + sessionId);
                return;
            }

            res.send("SOMETHING WENT WRONG");
            return;

        }

        res.send("No user with that code found");
        return;
    }
}

function hashPassword(password){
    const salt = randomBytes(16).toString("hex");
    const hashedPassword = scryptSync(password, salt, 64).toString('hex');

    return "" + salt + ":" + hashedPassword;
}
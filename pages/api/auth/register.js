import connectDB from "../../../backend-helper/connectDB";
import dbConfig from "../../../backend-helper/dbConfig";
import queryDB from "../../../backend-helper/queryDB";
import StatusCodeMsg from "../../../backend-helper/StatusCodeMsg";

export default async function register(req, res) {
    if(req.method == "POST"){
        const { email } = req.body;

        if(!email){
            res.status(200).json({
                code: 300,
                msg: StatusCodeMsg(300)
            })
        }

        const con = await connectDB(dbConfig).catch(e => {console.log(e)});
        const rows = await queryDB(con, "SELECT * FROM `cc-games`.auth WHERE email = \"" + email + "\" ").catch(e => {console.log(e)});

        if(rows.length == 0){
            //User is not registered
            let code = generateCode();

            const insert = await queryDB(con, "INSERT INTO `cc-games`.auth (email, code, lastLogin) VALUES ('" + email + "', '" + code + "', null)").catch(e => { console.log(e)});
            con.end();

            if(insert.affectedRows == 1){
                res.status(200).json({
                    code: 200,
                    msg: StatusCodeMsg(200)
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

function generateCode(){
    const allNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const length = 6;
    
    let code = "";

    for(let i = 0; i < length ; i++){
        code += allNumbers[parseInt(Math.random() * allNumbers.length)];
    }

    return code;
}
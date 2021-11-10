import connectDB from "../../../backend-helper/connectDB";
import dbConfig from "../../../backend-helper/dbConfig";
import queryDB from "../../../backend-helper/queryDB";

export default async function register(req, res) {
    if(req.method == "POST"){
        const { email } = req.body;

        if(!email){
            res.send("No Email Provided");
        }

        const con = await connectDB(dbConfig).catch(e => {console.log(e)});
        const rows = await queryDB(con, "SELECT * FROM `cc-games`.auth WHERE email = \"" + email + "\" ").catch(e => {console.log(e)});

        if(rows.length == 0){
            //User is not registered
            let code = generateCode();

            const insert = await queryDB(con, "INSERT INTO `cc-games`.auth (email, code, lastLogin) VALUES ('" + email + "', '" + code + "', null)").catch(e => { console.log(e)});
            
            if(insert.affectedRows == 1){
                res.send(code);
                return;
            }

            res.send("Something went wrong");
            return;
        } 
        res.send("User already registered. Did you mean forget Password ?");
        return;
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
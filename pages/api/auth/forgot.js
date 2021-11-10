import connectDB from "../../../backend-helper/connectDB";
import dbConfig from "../../../backend-helper/dbConfig";
import queryDB from "../../../backend-helper/queryDB";


export default async function forgot(req, res){
    if(req.method == "POST"){
        const { email } = req.body;

        if(!email){
            res.send("Incomplete Call. Nothing happens");
            return;
        }

        const con = await connectDB(dbConfig).catch(e => {console.log(e)});
        const rows = await queryDB(con, "SELECT * FROM `cc-games`.auth WHERE email=\"" + email + "\"").catch(e => {console.log(e)});

        if(rows.length == 1){
            const code = generateCode();
            const update = await queryDB(con, "UPDATE `cc-games`.auth SET password=null, lastLogin=null, code=\"" + code + "\" WHERE email=\"" + email + "\"").catch(e => {console.log(e)});
        
            if(update.affectedRows == 1){
                res.send(code);
                return;
            } 
            res.send("Something went wrong");
            return;
        }

        res.send("E-Mail not found");
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
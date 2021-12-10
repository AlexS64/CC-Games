import connectDB from './connectDB';
import dbConfig from './dbConfig';
import queryDB from './queryDB';

/**
 * 
 * @param {String} sid Header Cookie
 * @param {String} uid Header Cookie
 * @returns Email || False if Session is Valid
 */
export default async function validateSID(sid, uid){
    const con = await connectDB(dbConfig).catch(e => {console.log(e)});
    const s_id = await queryDB(con, 'SELECT * FROM `cc-games`.auth WHERE session=\'' + sid + '\'').catch(e => {console.log(e)});
    const email = await queryDB(con, "SELECT email FROM `cc-games`.users WHERE u_id=\"" + uid + "\"").catch(e => {console.log(e)});

    if(s_id.length == 1 && email.length == 1 && s_id[0].email == email[0].email){
        return email[0].email;
    }

    return false;
}
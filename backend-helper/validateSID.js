import connectDB from './connectDB';
import dbConfig from './dbConfig';
import queryDB from './queryDB';

/**
 * 
 * @param {String} sid The SID to validate
 * @returns email if valid sid is found, else FALSE
 */
export default async function validateSID(sid){
    const con = await connectDB(dbConfig).catch(e => {console.log(e)});
    const query = await queryDB(con, 'SELECT * FROM `cc-games`.auth WHERE session=\'' + sid + '\'').catch(e => {console.log(e)});

    if(query.length == 1){
        return query[0].email
    }

    return false;

}
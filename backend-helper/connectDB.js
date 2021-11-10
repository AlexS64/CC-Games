const mysql = require('mysql');

module.exports = async (params) => new Promise((resolve, reject) => {
    const connection = mysql.createConnection(params);

    connection.connect(err => {
        if(err){
            reject(err);
            return;
        }

        resolve(connection);
    });
});
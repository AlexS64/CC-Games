/**
 * If only one Element in the key parameter is present => Returns an Array with those key values
 * Else return an Array of Objects with all Parameter specified in key parameter
 * 
 * @param {QUERY} query the Query Object from the mysql Call
 * @param {Array} key Array of the keys included in every Object (If empty => allKeys)
 * @returns {Array} Array with Objects
 */
export function convertQueryToArray(query, key = []){
    let returnArray = [];
    query.forEach(element => {
        //Setting key
        if(key.length == 0){
            key = Object.keys(element);
        }

        if(key.length != 1){
            let obj = {};
    
            key.forEach(keyElement => {
                obj[keyElement] = element[keyElement];
            });
    
            returnArray.push(obj);
        } else {
            returnArray.push(element[key[0]]);
        }
    });

    return returnArray;
}
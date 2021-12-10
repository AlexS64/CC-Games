
export default function StatusCodeMsg(code){
    switch (code){
        case 200: return "Call Succesfull"

        case 300: return "Incomplete Call (Data Missing)"
        case 305: return "Incalid Call (Data not valid)"
        case 306: return "Session Invalid. Please Log In again"
        
        case 310: return "Lobby not found"
        case 311: return "Not allowed to join Lobby"
        
        case 400: return "Expected a POST call"

        case 500: return "Something went wrong server side"

        default: ""
    };
}
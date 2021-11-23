import StatusCodeMsg from "../../../backend-helper/StatusCodeMsg";
import validateSID from "../../../backend-helper/validateSID";
import cookie from 'cookie';

export default async function validateSession(req, res){
    if(req.method == "POST"){
        const { email } = req.body;
        let sid = req.headers.cookie?.split("=")[1];

        if(!email || !sid){
            res.status(200).json({
                code: 300,
                msg: StatusCodeMsg(300)
            });
            return;
        }

        if(await validateSID(sid) != email){
            res.setHeader('Set-Cookie', cookie.serialize('s_id', null, {
                httpOnly: false,
                secure: process.env.NODE_ENV !== "development",
                maxAge: 0,
                sameSite: 'strict',
                path: "/"
            }));
            
            res.status(200).json({
                code: 305,
                msg: StatusCodeMsg(305)
            });
            return;
        }

        res.status(200).json({
            code: 200,
            msg: StatusCodeMsg(200)
        });
    } else {
        res.status(200).json({
            code: 400,
            msg: StatusCodeMsg(400)
        });
    }
}
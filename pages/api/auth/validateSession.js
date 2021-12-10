import StatusCodeMsg from "../../../backend-helper/StatusCodeMsg";
import validateSID from "../../../backend-helper/validateSID";
import cookie from 'cookie';

export default async function validateSession(req, res){
    const cookies = cookie.parse(req.headers.cookie || '');
    const { s_id, u_id } = cookies;

    if(!s_id || !u_id){
        res.status(200).json({
            code: 300,
            msg: StatusCodeMsg(300)
        });
        return;
    }
   
    let isValid = await validateSID(s_id, u_id);

    if(!isValid){
        res.setHeader('Set-Cookie', [
            cookie.serialize('s_id', null, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== "development",
                maxAge: 0,
                sameSite: 'strict',
                path: "/"
            }),
            cookie.serialize('u_id', null, {
                httpOnly: false,
                secure: process.env.NODE_ENV !== "development",
                maxAge: 0,
                sameSite: 'strict',
                path: "/"
            })
        ]);

        res.status(200).json({
            code: 305,
            msg: StatusCodeMsg(305)
        });
        return;
    } 

    res.status(200).json({
        code: 200,
        msg: StatusCodeMsg(200),
        email: isValid
    });
}
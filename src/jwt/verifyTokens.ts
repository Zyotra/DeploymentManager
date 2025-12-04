import jwt from "jsonwebtoken";
export const verifyAccessToken=async (token:string):Promise<boolean | any>=>{
    try {
        const user=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET as string);
        if(!user) return false;
        return {
            status:true,
            user
        };
    } catch (error) {
        return false;
    }
}
export default verifyAccessToken;

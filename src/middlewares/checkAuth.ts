import Elysia, { Context } from "elysia";
import verifyAccessToken from "../jwt/verifyTokens";
import { StatusCode } from "../types/types";

const checkAuth = new Elysia().derive(async ({ body, set }: Context) => {
    const req = body as { token: string }
    const isValid = await verifyAccessToken(req.token)
    if (!isValid) {
        set.status = StatusCode.UNAUTHORIZED
        return {
            message: "Invalid Access Token"
        }
    }
    return {
        user: isValid?.user
    }
}).as("scoped")

const checkAuthPlugin = new Elysia()
    .use(checkAuth)
    .guard({
        beforeHandle: async ({ user, set }:Context | any) => {
            if(!user){
                set.status = StatusCode.UNAUTHORIZED
                return {
                    message: "Unauthorized"
                }
            }
        }
    }).as("scoped")
    export default checkAuthPlugin;
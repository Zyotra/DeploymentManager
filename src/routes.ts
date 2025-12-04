import { Context } from "elysia";
import { apiRoute, StatusCode } from "./types/types";
import addMachine from "./controllers/addMachines";
import updateMachine from "./controllers/updateMachine";

const routes: apiRoute[] = [
    {
        path: "/",
        method: 'get',
        handler: ({set}:Context) => {
            set.status=StatusCode.OK;
            return {
                status:"success",
                message: "Welcome to the Deployment Manager API of Zyotra",
                Time: new Date().toISOString()
            };
        },
        isProtected: false
    },{
        path: "/add-machine",
        method: 'post',
        handler: addMachine,
        isProtected: true
    },{
        path: "/update-machine/:id",
        method: 'put',
        handler: updateMachine,
        isProtected: true
    }
]
export default routes;
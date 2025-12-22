import { Context } from "elysia";
import { apiRoute, StatusCode } from "./types/types";
import addMachine from "./controllers/Machines/addMachines";
import updateMachine from "./controllers/Machines/updateMachine";
import getMachines from "./controllers/Machines/getMachines";
import deleteDomain from "./controllers/Domains/deleteDomain";
import deleteMachine from "./controllers/Machines/deleteMachine";
import addNewDomain from "./controllers/Domains/addNewDomain";
import getDomains from "./controllers/Domains/getDomains";
import viewDetails from "./controllers/Machines/viewDetails";
import authenticateGithubController from "./controllers/Github/authenticateGithubController";
import unauthenticateGithubController from "./controllers/Github/unauthenticateGithubController";
import getGithubStatusController from "./controllers/Github/getGithubStatusController";
import createSwapMemoryController from "./controllers/createSwapMemoryController";
import stopRedisController from "./controllers/stopRedisController";
import startRedisController from "./controllers/startRedisController";
import stopPostgresController from "./controllers/stopPostgresController";
import startPostgresController from "./controllers/startPostgresController";
import stopMySQLController from "./controllers/stopMySQLController";
import startMySQLController from "./controllers/startMySQLController";

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
    },
    {
        path: "/add-domain",
        method: 'post',
        handler: addNewDomain,
        isProtected: true
    },{
        path: "/update-machine/:id",
        method: 'put',
        handler: updateMachine,
        isProtected: true
    },{
        path: "/get-machines",
        method: 'get',
        handler:getMachines,
        isProtected: true
    },{
        path: "/get-domains",
        method: 'get',
        handler:getDomains,
        isProtected: true
    },{
        path: "/delete-machine/:id",
        method: 'delete',
        handler: deleteMachine,
        isProtected: true
    },{
        path: "/delete-domain/:id",
        method: 'delete',
        handler: deleteDomain,
        isProtected: true
    },{
        path:"/get-machine-analytics/:id",
        method:'get',
        handler:viewDetails,
        isProtected:true
    },{
        path:"/authenticate-github/:id",
        method:'post',
        handler:authenticateGithubController,
        isProtected:true
    },{
        path:"/unauthenticate-github/:id",
        method:'get',
        handler:unauthenticateGithubController,
        isProtected:true
    },{
        path:"/get-github-auths/:id",
        method:'get',
        handler:getGithubStatusController,
        isProtected:true
    },{
        path:"/create-swap-memory",
        method:"post",
        handler:createSwapMemoryController,
        isProtected:true
    },{
        path:"/stop-redis/:id",
        method:"get",
        handler:stopRedisController,
        isProtected:true
    },{
        path:"/start-redis/:id",
        method:"get",
        handler:startRedisController,
        isProtected:true
    },{
        path:"/stop-postgres/:id",
        method:"get",
        handler:stopPostgresController,
        isProtected:true
    },{
        path:"/start-postgres/:id",
        method:"get",
        handler:startPostgresController,
        isProtected:true
    },{
        path:"/stop-mysql/:id",
        method:"get",
        handler:stopMySQLController,
        isProtected:true
    },{
        path:"/start-mysql/:id",
        method:"get",
        handler:startMySQLController,
        isProtected:true
    }
]
export default routes;
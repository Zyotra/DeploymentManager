import { Context } from "elysia";
import { StatusCode } from "../../types/types";
import { userDomains } from "../../db/schema";
import { db } from "../../db/client";

const addNewDomain=async({body,set,userId}:Context | any)=>{
    const req=body as {
        domainAddress:string,
        vpsIp:string
    };
    if(!req.domainAddress || !req.vpsIp){
        set.status=400;
        return {
            status:"error",
            message:"Missing required fields"
        }
    }
    try {
        const newDomain=await db.insert(userDomains).values({
            domain_address:req.domainAddress,
            vps_ip:req.vpsIp,
            ownerId:userId
        }).returning();
        set.status=StatusCode.OK;
        return {
            status:"success",
            data:newDomain
        }
    } catch (error) {
        set.status=StatusCode.INTERNAL_SERVER_ERROR;
        return {
            status:"error",
            message:"Failed to add new domain",
            error:(error as Error).message
        }
    }  
}
export default addNewDomain;
import { Context } from "elysia";
import { StatusCode } from "../types/types";
import { vpsMachines } from "../db/schema";
import { eq } from "drizzle-orm";
import { db } from "../db/client";

const updateMachine=async({ set, body,params }: Context)=>{
    const vps_Id=params.id;
    const req=body as {
        newVpsPassword?:string,
    }
    if(!vps_Id){
        set.status=StatusCode.FORBIDDEN;
        return {
            status:"error",
            message:"Missing machine ID"
        }
    }
    if(!req.newVpsPassword){
        set.status=StatusCode.FORBIDDEN;
        return {
            status:"error",
            message:"Missing new VPS password"
        }
    }
    const machineExists=await db.select().from(vpsMachines).where(eq(vpsMachines.id,parseInt(vps_Id)));
    if(machineExists.length===0){
        set.status=StatusCode.NOT_FOUND;
        return {
            status:"error",
            message:"Machine not found"
        }
    }
    try {
        const updatedMachine=await db.update(vpsMachines).set({
            vps_password:req.newVpsPassword
        }).where(eq(vpsMachines.id,parseInt(vps_Id)));
        set.status=StatusCode.OK;
        return {
            status:"success",
            data:updatedMachine
        }
    } catch (error) {
        set.status=StatusCode.INTERNAL_SERVER_ERROR;
        return {
            status:"error",
            message:"Failed to update machine password",
            error:(error as Error).message
        }
    }
}
export default updateMachine;
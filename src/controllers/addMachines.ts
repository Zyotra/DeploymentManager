import { Context } from "elysia";
import { StatusCode } from "../types/types";
import { db } from "../db/client";
import { vpsMachines } from "../db/schema";
import encryptVpsPassword from "../crypto/encryptVpsPassword";

const addMachine = async ({ set, body, user }: Context | any) => {
    const req = body as {
        vpsIP: string,
        vpsName: string,
        vpsPassword: string,
        sshKey?: string
        expiryDate: string
    }
    if(!user || !user.id || !user.email){
        set.status = StatusCode.UNAUTHORIZED;
        return {
            status: "error",
            message: "Unauthorized.No user is associated with the request"
        }
    }
    var encryptedSSHKey: string | undefined = undefined;

    if (!req.vpsIP || !req.vpsName || !req.vpsPassword || !req.expiryDate) {
        set.status = StatusCode.FORBIDDEN;
        return {
            status: "error",
            message: "Missing required fields"
        }
    }
    try {
        if (req.sshKey) {
            encryptedSSHKey = encryptVpsPassword(req.sshKey);
        }
        const encryptedPassword: string = encryptVpsPassword(req.vpsPassword);
        const newMachine = await db.insert(vpsMachines).values({
            vps_ip: req.vpsIP,
            vps_name: req.vpsName,
            vps_password: encryptedPassword,
            ownerId: user.id,
            ownerEmail: user.email,
            ssh_key: encryptedSSHKey,
            expiryDate: new Date(req.expiryDate)
        }).returning();
        set.status = StatusCode.CREATED;
        return {
            status: "success",
            data: newMachine
        };
    } catch (error) {
        set.status = StatusCode.INTERNAL_SERVER_ERROR;
        return {
            status: "error",
            message: "Failed to add new machine",
            error: (error as Error).message
        }
    }

}
export default addMachine
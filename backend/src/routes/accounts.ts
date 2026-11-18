import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";
import { createLinuxAccount,deleteLinuxAccount } from "../services/linux-account.js";
const usernameSchema=z.string().regex(/^[a-z_][a-z0-9_-]{2,31}$/);
async function auth(request:any,reply:any){try{await request.jwtVerify();}catch{return reply.code(401).send({error:"Unauthorized"});}}
export async function accountRoutes(app:FastifyInstance){
 app.addHook("preHandler",auth);
 app.get("/",async request=>{const actor=request.user as {sub:string;role:string};if(!["ADMIN","RESELLER"].includes(actor.role))return {error:"Forbidden"};return prisma.sshAccount.findMany({where:actor.role==="ADMIN"?{}:{ownerId:actor.sub},select:{id:true,username:true,expiresAt:true,maxSessions:true,status:true,isTrial:true}});});
 app.post("/",async(request,reply)=>{
  const actor=request.user as {sub:string;role:string};if(!["ADMIN","RESELLER"].includes(actor.role))return reply.code(403).send({error:"Forbidden"});
  const parsed=z.object({username:usernameSchema,password:z.string().min(12).max(128),expiresAt:z.coerce.date(),maxSessions:z.number().int().min(1).max(10).default(1),isTrial:z.boolean().default(false)}).safeParse(request.body);
  if(!parsed.success||parsed.data.expiresAt<=new Date())return reply.code(400).send({error:"Invalid account data"});
  const owner=await prisma.user.findUnique({where:{id:actor.sub}});if(!owner)return reply.code(401).send({error:"Unauthorized"});
  try{await createLinuxAccount(parsed.data.username,parsed.data.password);const account=await prisma.sshAccount.create({data:{username:parsed.data.username,ownerId:owner.id,expiresAt:parsed.data.expiresAt,maxSessions:parsed.data.maxSessions,isTrial:parsed.data.isTrial},select:{id:true,username:true,expiresAt:true,maxSessions:true,status:true,isTrial:true}});return reply.code(201).send(account);}catch(error){request.log.error({err:error},"account creation failed");return reply.code(500).send({error:"Account creation failed"});}
 });
 app.post("/:username/renew",async(request,reply)=>{const actor=request.user as {sub:string;role:string};if(!["ADMIN","RESELLER"].includes(actor.role))return reply.code(403).send({error:"Forbidden"});const body=z.object({expiresAt:z.coerce.date()}).safeParse(request.body);const params=z.object({username:usernameSchema}).safeParse(request.params);if(!body.success||!params.success||body.data.expiresAt<=new Date())return reply.code(400).send({error:"Invalid renewal data"});const existing=await prisma.sshAccount.findUnique({where:{username:params.data.username}});if(!existing||(actor.role==="RESELLER"&&existing.ownerId!==actor.sub))return reply.code(404).send({error:"Account not found"});return prisma.sshAccount.update({where:{username:params.data.username},data:{expiresAt:body.data.expiresAt,status:"ACTIVE"},select:{username:true,expiresAt:true,status:true}});});
 app.delete("/:username",async(request,reply)=>{const actor=request.user as {sub:string;role:string};if(actor.role!=="ADMIN")return reply.code(403).send({error:"Admin only"});const params=z.object({username:usernameSchema}).safeParse(request.params);if(!params.success)return reply.code(400).send({error:"Invalid username"});const existing=await prisma.sshAccount.findUnique({where:{username:params.data.username}});if(!existing)return reply.code(404).send({error:"Account not found"});try{await deleteLinuxAccount(params.data.username);await prisma.sshAccount.delete({where:{username:params.data.username}});return reply.code(204).send();}catch(error){request.log.error({err:error},"account deletion failed");return reply.code(500).send({error:"Account deletion failed"});}});
}

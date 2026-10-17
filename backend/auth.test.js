import test from 'node:test';import assert from 'node:assert/strict';import bcrypt from 'bcryptjs';
import { loginSchema, leadSchema } from './validators/schemas.js';
test('login rejects malformed email',()=>{assert.equal(loginSchema.safeParse({email:'bad',password:'hello'}).success,false)});
test('lead requires a full name',()=>{assert.equal(leadSchema.safeParse({full_name:'',status:'New'}).success,false)});
test('lead accepts supported statuses and normalizes empty optional email',()=>{const r=leadSchema.safeParse({full_name:'Jordan Lee',status:'Qualified',email:'',assigned_to:'',follow_up_date:''});assert.equal(r.success,true);assert.equal(r.data.email,null);assert.equal(r.data.assigned_to,null)});
test('unsupported lead status is rejected',()=>{assert.equal(leadSchema.safeParse({full_name:'Jordan Lee',status:'Won'}).success,false)});
test('bcrypt hash validates password without storing plaintext',async()=>{const hash=await bcrypt.hash('SafeTestPass123!',4);assert.notEqual(hash,'SafeTestPass123!');assert.equal(await bcrypt.compare('SafeTestPass123!',hash),true);assert.equal(await bcrypt.compare('wrong',hash),false)});

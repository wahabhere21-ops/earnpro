// EarnPro v2.1 - Professional English Platform
import crypto from 'crypto'

const BLOB_ID = process.env.JSONBLOB_ID || '019df79e-c560-7761-9342-ade85e4e9d29'
const BASE_URL = 'https://jsonblob.com/api/jsonBlob'

let _cache: Record<string, any[]> | null = null
let _cacheTime = 0
const CACHE_TTL = 2000

function uuid(): string { return crypto.randomUUID() }
function now(): string { return new Date().toISOString() }

function safe(obj: any, key: string): any {
  return obj && typeof obj === 'object' ? obj[key] : undefined
}

async function readData(): Promise<Record<string, any[]>> {
  if (_cache && Date.now() - _cacheTime < CACHE_TTL) return _cache
  try {
    const res = await fetch(`${BASE_URL}/${BLOB_ID}`, { headers: { 'Accept': 'application/json' } })
    if (!res.ok) throw new Error(`Read failed: ${res.status}`)
    _cache = await res.json()
    _cacheTime = Date.now()
    return _cache!
  } catch (err) {
    console.error('JSONBlob read error:', err)
    return _cache || { users: [], reviews: [], settings: [], transactions: [], withdrawals: [], paymentSlips: [] }
  }
}

async function writeData(data: Record<string, any[]>): Promise<void> {
  _cache = data
  _cacheTime = Date.now()
  try {
    const res = await fetch(`${BASE_URL}/${BLOB_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (!res.ok) throw new Error(`Write failed: ${res.status}`)
  } catch (err) { console.error('JSONBlob write error:', err) }
}

type W = Record<string, any>

function matchRec(r: any, w: W): boolean {
  if (!w) return true
  for (const [k, v] of Object.entries(w)) {
    if (v == null) continue
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      if ('contains' in v) { if (!String(r[k] || '').toLowerCase().includes(String(v.contains).toLowerCase())) return false }
      else if ('in' in v) { if (!(v.in as any[]).includes(r[k])) return false }
    } else { if (r[k] !== v) return false }
  }
  return true
}

function filterRecs(records: any[], where?: W): any[] {
  if (!where) return records
  if (where.OR) return records.filter(r => (where.OR as W[]).some(c => matchRec(r, c)))
  return records.filter(r => matchRec(r, where))
}

function sortRecs(records: any[], orderBy?: any): any[] {
  if (!orderBy) return records
  const s = [...records]
  const f = Object.keys(orderBy)[0]
  const d = orderBy[f] === 'desc' ? -1 : 1
  s.sort((a, b) => { const va = a[f]; const vb = b[f]; return va < vb ? -d : va > vb ? d : 0 })
  return s
}

function pick(r: any, sel?: any): any {
  if (!sel) return r
  const o: any = {}
  for (const [k, v] of Object.entries(sel)) {
    if (v === true) o[k] = r[k]
    else if (v && typeof v === 'object' && r[k]) o[k] = pick(r[k], v)
  }
  return o
}

async function loadRel(record: any, inc: any, all: Record<string, any[]>): Promise<any> {
  if (!inc) return record
  const r = { ...record }
  for (const [rel, opts] of Object.entries(inc)) {
    if (rel === 'referrals') {
      let refs = all.users.filter(u => u.referredById === r.id)
      refs = sortRecs(refs, safe(opts, 'orderBy'))
      if (safe(opts, 'select')) refs = refs.map(x => pick(x, opts.select))
      r.referrals = refs
    } else if (rel === 'user') {
      const u = all.users.find(u => u.id === r.userId)
      r.user = u ? (opts === true ? u : pick(u, opts)) : null
    }
  }
  return r
}

function fieldUpd(rec: any, data: any): any {
  const u = { ...rec, updatedAt: now() }
  for (const [k, v] of Object.entries(data)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      if ('increment' in v) u[k] = (u[k] || 0) + v.increment
      else if ('decrement' in v) u[k] = (u[k] || 0) - v.decrement
      else if ('set' in v) u[k] = v.set
      else u[k] = v
    } else u[k] = v
  }
  return u
}

function findIdx(records: any[], where?: W): number {
  if (!where) return 0
  const keys = Object.keys(where).filter(k => k !== 'OR')
  return records.findIndex(r => keys.every(k => r[k] === where[k]))
}

function mk(col: string) {
  return {
    findUnique: async (args: any = {}) => {
      const { where, include, select } = args
      const data = await readData()
      const recs = data[col] || []
      const idx = findIdx(recs, where)
      if (idx === -1) return null
      let r = recs[idx]
      if (include) r = await loadRel(r, include, data)
      if (select) r = pick(r, select)
      return r
    },
    findMany: async (args: any = {}) => {
      const { where, orderBy, skip, take, include, select } = args
      const data = await readData()
      let recs = filterRecs(data[col] || [], where)
      recs = sortRecs(recs, orderBy)
      if (skip) recs = recs.slice(skip)
      if (take) recs = recs.slice(0, take)
      if (include || select) recs = await Promise.all(recs.map(async r => {
        if (include) r = await loadRel(r, include, data)
        if (select) r = pick(r, select)
        return r
      }))
      return recs
    },
    findFirst: async (args: any = {}) => {
      const { where, include, select } = args
      const data = await readData()
      let recs = filterRecs(data[col] || [], where)
      if (!recs.length) return null
      let r = recs[0]
      if (include) r = await loadRel(r, include, data)
      if (select) r = pick(r, select)
      return r
    },
    create: async (args: any = {}) => {
      const createData = args.data || args
      const data = await readData()
      if (!data[col]) data[col] = []
      const nr = { id: uuid(), ...createData, createdAt: createData.createdAt || now(), updatedAt: now() }
      data[col].push(nr)
      await writeData(data)
      return nr
    },
    createMany: async (args: any = {}) => {
      const items = args.data || []
      const data = await readData()
      if (!data[col]) data[col] = []
      for (const item of items) data[col].push({ id: uuid(), ...item, createdAt: item.createdAt || now(), updatedAt: now() })
      await writeData(data)
      return { count: items.length }
    },
    update: async (args: any = {}) => {
      const { where, data: upd } = args
      const data = await readData()
      const recs = data[col] || []
      const idx = findIdx(recs, where)
      if (idx === -1) throw new Error(`Not found in ${col}`)
      recs[idx] = fieldUpd(recs[idx], upd)
      await writeData(data)
      return recs[idx]
    },
    upsert: async (args: any = {}) => {
      const { where, update, create } = args
      const data = await readData()
      const recs = data[col] || []
      const idx = findIdx(recs, where)
      if (idx !== -1) { recs[idx] = fieldUpd(recs[idx], update); await writeData(data); return recs[idx] }
      const nr = { id: uuid(), ...create, createdAt: create.createdAt || now(), updatedAt: now() }
      recs.push(nr)
      await writeData(data)
      return nr
    },
    delete: async (args: any = {}) => {
      const where = args.where
      const data = await readData()
      const recs = data[col] || []
      const idx = findIdx(recs, where)
      if (idx === -1) throw new Error(`Not found in ${col}`)
      const del = recs.splice(idx, 1)[0]
      await writeData(data)
      return del
    },
    deleteMany: async (args: any = {}) => {
      const where = args.where
      const data = await readData()
      const recs = data[col] || []
      const before = recs.length
      data[col] = where ? recs.filter(r => !matchRec(r, where)) : []
      await writeData(data)
      return { count: before - data[col].length }
    },
    count: async (args: any = {}) => {
      const where = args.where
      const data = await readData()
      const recs = data[col] || []
      return where ? filterRecs(recs, where).length : recs.length
    },
    aggregate: async (args: any = {}) => {
      const { where, _sum, _count } = args
      const data = await readData()
      let recs = data[col] || []
      if (where) recs = filterRecs(recs, where)
      const res: any = {}
      if (_sum) { res._sum = {}; for (const k of Object.keys(_sum)) res._sum[k] = recs.reduce((s: number, r: any) => s + (Number(r[k]) || 0), 0) }
      if (_count) { res._count = {}; for (const [k, v] of Object.entries(_count)) { if (v === true) res._count[k] = recs.filter((r: any) => r[k] != null).length } }
      return res
    }
  }
}

const db: any = {
  user: mk('users'), review: mk('reviews'), settings: mk('settings'),
  transaction: mk('transactions'), withdrawal: mk('withdrawals'), paymentSlip: mk('paymentSlips'),
  $executeRawUnsafe: async () => null,
  $disconnect: async () => {},
  $connect: async () => {},
}

export { db }
export const prisma = db

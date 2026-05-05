import crypto from 'crypto'

// ============================================================
// JSON-based Prisma-compatible Database for EarnPro
// Uses jsonblob.com as free JSON storage backend
// ============================================================

const BLOB_ID = process.env.JSONBLOB_ID || '019df79e-c560-7761-9342-ade85e4e9d29'
const BASE_URL = 'https://jsonblob.com/api/jsonBlob'

// Simple in-memory cache to reduce API calls
let _cache: Record<string, any[]> | null = null
let _cacheTime = 0
const CACHE_TTL = 2000 // 2 seconds

function uuid(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

// --- Low-level read/write ---

async function readData(): Promise<Record<string, any[]>> {
  if (_cache && Date.now() - _cacheTime < CACHE_TTL) return _cache
  try {
    const res = await fetch(`${BASE_URL}/${BLOB_ID}`, {
      headers: { 'Accept': 'application/json' }
    })
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
    const res = await fetch(`${BASE_URL}/${BLOB_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error(`Write failed: ${res.status}`)
  } catch (err) {
    console.error('JSONBlob write error:', err)
  }
}

// --- Query helpers ---

type WhereClause = Record<string, any>

function matchesWhere(record: any, where: WhereClause): boolean {
  if (!where) return true
  for (const [key, value] of Object.entries(where)) {
    if (value === null || value === undefined) continue
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if ('contains' in value) {
        const fieldVal = String(record[key] || '').toLowerCase()
        const searchVal = String(value.contains).toLowerCase()
        if (!fieldVal.includes(searchVal)) return false
      } else if ('in' in value) {
        if (!value.in.includes(record[key])) return false
      }
    } else {
      if (record[key] !== value) return false
    }
  }
  return true
}

function matchesOrWhere(record: any, orClauses: WhereClause[]): boolean {
  if (!orClauses || orClauses.length === 0) return true
  return orClauses.some(clause => matchesWhere(record, clause))
}

function applyWhere(records: any[], where?: WhereClause): any[] {
  if (!where) return records
  if (where.OR) {
    return records.filter(r => matchesOrWhere(r, where.OR))
  }
  const andKeys = Object.keys(where).filter(k => k !== 'OR')
  const andWhere: WhereClause = {}
  andKeys.forEach(k => { andWhere[k] = where[k] })
  if (Object.keys(andWhere).length > 0) {
    return records.filter(r => matchesWhere(r, andWhere))
  }
  return records
}

function applyOrderBy(records: any[], orderBy?: any): any[] {
  if (!orderBy) return records
  const sorted = [...records]
  const field = Object.keys(orderBy)[0]
  const dir = orderBy[field] === 'desc' ? -1 : 1
  sorted.sort((a, b) => {
    const va = a[field]
    const vb = b[field]
    if (va < vb) return -1 * dir
    if (va > vb) return 1 * dir
    return 0
  })
  return sorted
}

function applySelect(record: any, select?: any): any {
  if (!select) return record
  const result: any = {}
  for (const [key, val] of Object.entries(select)) {
    if (val === true) result[key] = record[key]
    else if (val && typeof val === 'object' && record[key]) {
      result[key] = applySelect(record[key], val)
    }
  }
  return result
}

async function applyInclude(record: any, include: any, allData: Record<string, any[]>): Promise<any> {
  if (!include) return record
  const result = { ...record }
  for (const [relation, opts] of Object.entries(include)) {
    if (relation === 'referrals') {
      let refs = allData.users.filter(u => u.referredById === record.id)
      refs = applyOrderBy(refs, (opts as any)?.orderBy)
      if ((opts as any)?.select) {
        refs = refs.map(r => applySelect(r, (opts as any).select))
      }
      result.referrals = refs
    } else if (relation === 'user') {
      const user = allData.users.find(u => u.id === record.userId)
      if (user) {
        result.user = (opts === true) ? user : applySelect(user, opts as any)
      } else {
        result.user = null
      }
    }
  }
  return result
}

function applyFieldUpdate(record: any, data: any): any {
  const updated = { ...record, updatedAt: now() }
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if ('increment' in value) {
        updated[key] = (updated[key] || 0) + value.increment
      } else if ('decrement' in value) {
        updated[key] = (updated[key] || 0) - value.decrement
      } else if ('set' in value) {
        updated[key] = value.set
      } else {
        updated[key] = value
      }
    } else {
      updated[key] = value
    }
  }
  return updated
}

// --- Create Model Factory ---

function createModel(collectionName: string) {
  return {
    findUnique: async (args: any = {}) => { const { where, include, select } = args;
      const data = await readData()
      let records = data[collectionName] || []
      const whereKeys = where ? Object.keys(where).filter(k => k !== 'OR') : []
      let result = records.find(r => whereKeys.every(k => r[k] === where[k]))
      if (!result) return null
      if (include) result = await applyInclude(result, include, data)
      if (select) result = applySelect(result, select)
      return result
    },

    findMany: async (args: any = {}) => { const { where, orderBy, skip, take, include, select } = args;
      const data = await readData()
      let records = data[collectionName] || []
      records = applyWhere(records, where)
      records = applyOrderBy(records, orderBy)
      if (skip) records = records.slice(skip)
      if (take) records = records.slice(0, take)
      if (include || select) {
        records = await Promise.all(records.map(async r => {
          if (include) r = await applyInclude(r, include, data)
          if (select) r = applySelect(r, select)
          return r
        }))
      }
      return records
    },

    findFirst: async (args: any = {}) => { const { where, include, select } = args;
      const data = await readData()
      let records = data[collectionName] || []
      records = applyWhere(records, where)
      if (records.length === 0) return null
      let result = records[0]
      if (include) result = await applyInclude(result, include, data)
      if (select) result = applySelect(result, select)
      return result
    },

    create: async (args: any = {}) => { const { data: createData } = args;
      const data = await readData()
      if (!data[collectionName]) data[collectionName] = []
      const newRecord = {
        id: uuid(),
        ...createData,
        createdAt: createData.createdAt || now(),
        updatedAt: now()
      }
      data[collectionName].push(newRecord)
      await writeData(data)
      return newRecord
    },

    createMany: async (args: any = {}) => {
      const { data: items } = args;
      const data = await readData()
      if (!data[collectionName]) data[collectionName] = []
      for (const item of items {
        data[collectionName].push({
          id: uuid(),
          ...item,
          createdAt: item.createdAt || now(),
          updatedAt: now()
        })
      }
      await writeData(data)
      return { count: items.length }
    },

    update: async (args: any = {}) => { const { where, data: updateData } = args;
      const data = await readData()
      const records = data[collectionName] || []
      const idx = records.findIndex(r => {
        const keys = Object.keys(where).filter(k => k !== 'OR')
        return keys.every(k => r[k] === where[k])
      })
      if (idx === -1) throw new Error(`Record not found in ${collectionName}`)
      records[idx] = applyFieldUpdate(records[idx], updateData)
      await writeData(data)
      return records[idx]
    },

    upsert: async (args: any = {}) => { const { where, update, create } = args;
      const data = await readData()
      const records = data[collectionName] || []
      const idx = records.findIndex(r => {
        const keys = Object.keys(where).filter(k => k !== 'OR')
        return keys.every(k => r[k] === where[k])
      })
      if (idx !== -1) {
        records[idx] = applyFieldUpdate(records[idx], update)
        await writeData(data)
        return records[idx]
      } else {
        const newRecord = {
          id: uuid(),
          ...create,
          createdAt: create.createdAt || now(),
          updatedAt: now()
        }
        records.push(newRecord)
        await writeData(data)
        return newRecord
      }
    },

    delete: async (args: any = {}) => { const { where } = args;
      const data = await readData()
      const records = data[collectionName] || []
      const idx = records.findIndex(r => {
        const keys = Object.keys(where).filter(k => k !== 'OR')
        return keys.every(k => r[k] === where[k])
      })
      if (idx === -1) throw new Error(`Record not found in ${collectionName}`)
      const deleted = records.splice(idx, 1)[0]
      await writeData(data)
      return deleted
    },

    deleteMany: async (args: any = {}) => { const { where } = args;
      const data = await readData()
      let records = data[collectionName] || []
      const before = records.length
      if (where) {
        records = records.filter(r => !matchesWhere(r, where))
      } else {
        records = []
      }
      data[collectionName] = records
      await writeData(data)
      return { count: before - records.length }
    },

    count: async (args: any = {}) => { const { where } = args;
      const data = await readData()
      let records = data[collectionName] || []
      if (where) records = applyWhere(records, where)
      return records.length
    },

    aggregate: async (args: any = {}) => { const { where, _sum, _count } = args;
      const data = await readData()
      let records = data[collectionName] || []
      if (where) records = applyWhere(records, where)
      const result: any = {}
      if (_sum) {
        result._sum = {}
        for (const [key] of Object.entries(_sum)) {
          result._sum[key] = records.reduce((sum: number, r: any) => sum + (Number(r[key]) || 0), 0)
        }
      }
      if (_count) {
        result._count = {}
        for (const [key, val] of Object.entries(_count)) {
          if (val === true) {
            result._count[key] = records.filter((r: any) => r[key] != null).length
          }
        }
      }
      return result
    }
  }
}

// --- Create the db object ---

const db: any = {
  user: createModel('users'),
  review: createModel('reviews'),
  settings: createModel('settings'),
  transaction: createModel('transactions'),
  withdrawal: createModel('withdrawals'),
  paymentSlip: createModel('paymentSlips'),
  $executeRawUnsafe: async (_sql: string) => {
    return null
  },
  $disconnect: async () => {},
  $connect: async () => {},
}

export { db }
export const prisma = db

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'

const dbPath = path.join(__dirname, 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any)

const FISCAL_MONTHS = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June']

const DEPARTMENTS = ['Electrical', 'Mechanical', 'SP', 'Admin', 'RM-YARD', 'MML', 'QCM', 'CCM', 'SMS']

const FAULT_TYPES = [
  'Not Closed', 'Emergency Number N/F', 'Receiver Name N/F', 'Issuer Name N/F',
  'Supervisor name N/F', 'Fire Watcher Sign Missing', 'Location In charge Name N/F',
  'Plant/Department head sign N/F', 'Receiving Dept. Name N/F', 'Job Location N/F',
  'Issuing Dept. Name N/F', 'Location In charge Sign N/F', 'Other'
]

const julySeedData: Record<string, { issued: number; received: number; closed: number; withFaults: number }> = {
  'Electrical': { issued: 214, received: 328, closed: 324, withFaults: 15 },
  'Mechanical': { issued: 121, received: 197, closed: 190, withFaults: 13 },
  'SP':         { issued: 2,   received: 2,   closed: 2,   withFaults: 0 },
  'Admin':      { issued: 12,  received: 11,  closed: 11,  withFaults: 0 },
  'RM-YARD':    { issued: 124, received: 124, closed: 121, withFaults: 4 },
  'MML':        { issued: 64,  received: 58,  closed: 56,  withFaults: 6 },
  'QCM':        { issued: 16,  received: 3,   closed: 3,   withFaults: 2 },
  'CCM':        { issued: 29,  received: 11,  closed: 11,  withFaults: 1 },
  'SMS':        { issued: 210, received: 58,  closed: 56,  withFaults: 10 },
}

async function main() {
  console.log('Seeding database...')

  const hashedPassword = await bcrypt.hash('Admin@123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@site.com' },
    update: {},
    create: { email: 'admin@site.com', password: hashedPassword, name: 'Site Admin', role: 'data_entry' },
  })
  console.log('Created user: admin@site.com / Admin@123')

  const year = 2025
  const month = 'July'

  for (const dept of DEPARTMENTS) {
    const data = julySeedData[dept]
    await prisma.monthlyPermitLog.upsert({
      where: { year_month_department: { year, month, department: dept } },
      update: {},
      create: {
        year, month, department: dept,
        permitsIssued: data.issued, permitsReceived: data.received,
        permitsClosed: data.closed, permitsWithFaults: data.withFaults,
      },
    })
  }

  for (const faultType of FAULT_TYPES) {
    await prisma.faultTypeLog.upsert({
      where: { year_month_faultType: { year, month, faultType } },
      update: {},
      create: { year, month, faultType, count: 0 },
    })
  }

  console.log('Seed complete!')
  console.log(`Fiscal months order: ${FISCAL_MONTHS.join(', ')}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

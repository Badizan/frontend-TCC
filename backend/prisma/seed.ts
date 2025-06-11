import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10)

  // Criar usuários
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '(11) 99999-9999'
    },
  })

  const mechanic = await prisma.user.upsert({
    where: { email: 'mecanico@example.com' },
    update: {},
    create: {
      email: 'mecanico@example.com',
      name: 'João Mecânico',
      password: hashedPassword,
      role: 'MECHANIC',
      phone: '(11) 88888-8888'
    },
  })

  const owner = await prisma.user.upsert({
    where: { email: 'proprietario@example.com' },
    update: {},
    create: {
      email: 'proprietario@example.com',
      name: 'Maria Proprietária',
      password: hashedPassword,
      role: 'RECEPTIONIST',
      phone: '(11) 77777-7777'
    },
  })

  // Criar veículos
  const vehicle1 = await prisma.vehicle.upsert({
    where: { licensePlate: 'ABC-1234' },
    update: {},
    create: {
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      licensePlate: 'ABC-1234',
      type: 'CAR',
      ownerId: owner.id,
    },
  })

  const vehicle2 = await prisma.vehicle.upsert({
    where: { licensePlate: 'XYZ-5678' },
    update: {},
    create: {
      brand: 'Honda',
      model: 'Civic',
      year: 2019,
      licensePlate: 'XYZ-5678',
      type: 'CAR',
      ownerId: owner.id,
    },
  })

  // Criar manutenções
  const maintenance1 = await prisma.maintenance.create({
    data: {
      vehicleId: vehicle1.id,
      mechanicId: mechanic.id,
      type: 'PREVENTIVE',
      status: 'COMPLETED',
      description: 'Troca de óleo e filtros',
      scheduledDate: new Date('2024-01-15'),
      completedDate: new Date('2024-01-15'),
      cost: 150.00,
      notes: 'Serviço realizado conforme programado'
    }
  })

  const maintenance2 = await prisma.maintenance.create({
    data: {
      vehicleId: vehicle2.id,
      mechanicId: mechanic.id,
      type: 'CORRECTIVE',
      status: 'SCHEDULED',
      description: 'Reparo no freio dianteiro',
      scheduledDate: new Date('2024-06-20'),
      cost: 300.00
    }
  })

  // Criar lembretes
  const reminder1 = await prisma.reminder.create({
    data: {
      vehicleId: vehicle1.id,
      description: 'Revisão dos 20.000 km',
      dueDate: new Date('2024-07-01'),
      completed: false
    }
  })

  const reminder2 = await prisma.reminder.create({
    data: {
      vehicleId: vehicle2.id,
      description: 'Troca de pneus',
      dueDate: new Date('2024-08-15'),
      completed: false
    }
  })

  // Criar despesas
  const expense1 = await prisma.expense.create({
    data: {
      vehicleId: vehicle1.id,
      description: 'Óleo sintético',
      category: 'Manutenção',
      amount: 80.00,
      date: new Date('2024-01-15')
    }
  })

  const expense2 = await prisma.expense.create({
    data: {
      vehicleId: vehicle1.id,
      description: 'Filtro de ar',
      category: 'Peças',
      amount: 45.00,
      date: new Date('2024-01-15')
    }
  })

  const expense3 = await prisma.expense.create({
    data: {
      vehicleId: vehicle2.id,
      description: 'Combustível',
      category: 'Combustível',
      amount: 120.00,
      date: new Date('2024-06-01')
    }
  })

  // Criar serviços
  const service1 = await prisma.service.create({
    data: {
      name: 'Troca de Óleo',
      description: 'Troca completa do óleo do motor',
      price: 100.00,
      duration: 60 // em minutos
    }
  })

  const service2 = await prisma.service.create({
    data: {
      name: 'Alinhamento e Balanceamento',
      description: 'Alinhamento da direção e balanceamento das rodas',
      price: 80.00,
      duration: 90
    }
  })

  console.log('Seed executado com sucesso!')
  console.log('Usuários criados:', { admin, mechanic, owner })
  console.log('Veículos criados:', { vehicle1, vehicle2 })
  console.log('Dados de exemplo inseridos no banco!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
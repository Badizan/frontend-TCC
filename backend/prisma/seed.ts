import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  const hashedPassword = await bcrypt.hash('123456', 10)

  // Limpar dados existentes (opcional)
  console.log('🧹 Limpando dados existentes...')
  await prisma.notification.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.reminder.deleteMany()
  await prisma.maintenance.deleteMany()
  await prisma.mileageRecord.deleteMany()
  await prisma.userSettings.deleteMany()
  await prisma.service.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.user.deleteMany()

  // Criar usuários
  console.log('👥 Criando usuários...')
  const admin = await prisma.user.create({
    data: {
      email: 'admin@oficina.com',
      name: 'Carlos Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '(11) 99999-9999'
    }
  })

  const owner1 = await prisma.user.create({
    data: {
      email: 'cliente1@email.com',
      name: 'Ana Paula Cliente',
      password: hashedPassword,
      role: 'OWNER',
      phone: '(11) 55555-5555'
    }
  })

  const owner2 = await prisma.user.create({
    data: {
      email: 'cliente2@email.com',
      name: 'Roberto Oliveira',
      password: hashedPassword,
      role: 'OWNER',
      phone: '(11) 44444-4444'
    }
  })

  const owner3 = await prisma.user.create({
    data: {
      email: 'cliente3@email.com',
      name: 'Fernanda Costa',
      password: hashedPassword,
      role: 'OWNER',
      phone: '(11) 33333-3333'
    }
  })

  // Criar configurações para usuários
  console.log('⚙️ Criando configurações de usuários...')
  await prisma.userSettings.create({
    data: {
      userId: owner1.id,
      channels: {
        inApp: true,
        email: true
      },
      categories: {
        maintenance: { inApp: true, email: true },
        expenses: { inApp: true, email: true },
        reminders: { inApp: true, email: true },
        system: { inApp: true, email: false }
      },
      advancedSettings: {
        maintenanceReminderDays: 7,
        mileageAlertThreshold: 1000,
        monthlyExpenseLimit: 500
      }
    }
  })

  await prisma.userSettings.create({
    data: {
      userId: owner2.id,
      channels: {
        inApp: false,
        email: true
      },
      categories: {
        maintenance: { inApp: false, email: true },
        expenses: { inApp: false, email: true },
        reminders: { inApp: false, email: true },
        system: { inApp: false, email: false }
      },
      advancedSettings: {
        maintenanceReminderDays: 15,
        mileageAlertThreshold: 2000,
        monthlyExpenseLimit: 1000
      }
    }
  })

  // Criar veículos
  console.log('🚗 Criando veículos...')
  const vehicle1 = await prisma.vehicle.create({
    data: {
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      licensePlate: 'ABC-1234',
      type: 'CAR',
      color: 'Prata',
      mileage: 45000,
      ownerId: owner1.id
    }
  })

  const vehicle2 = await prisma.vehicle.create({
    data: {
      brand: 'Honda',
      model: 'Civic',
      year: 2019,
      licensePlate: 'XYZ-5678',
      type: 'CAR',
      color: 'Branco',
      mileage: 52000,
      ownerId: owner1.id
    }
  })

  const vehicle3 = await prisma.vehicle.create({
    data: {
      brand: 'Volkswagen',
      model: 'Gol',
      year: 2018,
      licensePlate: 'DEF-9012',
      type: 'CAR',
      color: 'Azul',
      mileage: 68000,
      ownerId: owner2.id
    }
  })

  const vehicle4 = await prisma.vehicle.create({
    data: {
      brand: 'Ford',
      model: 'Ka',
      year: 2021,
      licensePlate: 'GHI-3456',
      type: 'CAR',
      color: 'Vermelho',
      mileage: 25000,
      ownerId: owner2.id
    }
  })

  const vehicle5 = await prisma.vehicle.create({
    data: {
      brand: 'Yamaha',
      model: 'Factor 125',
      year: 2020,
      licensePlate: 'JKL-7890',
      type: 'MOTORCYCLE',
      color: 'Preto',
      mileage: 15000,
      ownerId: owner3.id
    }
  })

  const vehicle6 = await prisma.vehicle.create({
    data: {
      brand: 'Mercedes-Benz',
      model: 'Sprinter',
      year: 2019,
      licensePlate: 'MNO-2468',
      type: 'VAN',
      color: 'Branco',
      mileage: 95000,
      ownerId: owner3.id
    }
  })

  // Criar registros de quilometragem
  console.log('📊 Criando registros de quilometragem...')
  const dates = [
    new Date('2024-01-01'),
    new Date('2024-02-01'),
    new Date('2024-03-01'),
    new Date('2024-04-01'),
    new Date('2024-05-01'),
    new Date('2024-06-01'),
  ]

  let mileage = 40000
  for (const date of dates) {
    await prisma.mileageRecord.create({
      data: {
        vehicleId: vehicle1.id,
        mileage: mileage,
        date: date,
        notes: `Leitura do odômetro em ${date.toLocaleDateString()}`
      }
    })
    mileage += Math.floor(Math.random() * 2000) + 500
  }

  // Criar serviços
  console.log('🔧 Criando serviços...')
  const services = [
    { name: 'Troca de Óleo', desc: 'Troca completa do óleo do motor com filtro', price: 120.00, duration: 60 },
    { name: 'Alinhamento', desc: 'Alinhamento da direção', price: 80.00, duration: 45 },
    { name: 'Balanceamento', desc: 'Balanceamento das rodas', price: 60.00, duration: 30 },
    { name: 'Revisão Completa', desc: 'Revisão geral do veículo', price: 350.00, duration: 180 },
    { name: 'Troca de Pastilhas', desc: 'Substituição das pastilhas de freio', price: 180.00, duration: 90 },
    { name: 'Troca de Pneus', desc: 'Substituição de pneus (4 unidades)', price: 800.00, duration: 60 },
    { name: 'Diagnóstico Eletrônico', desc: 'Diagnóstico completo dos sistemas eletrônicos', price: 150.00, duration: 120 },
    { name: 'Limpeza de Bicos', desc: 'Limpeza e teste dos bicos injetores', price: 200.00, duration: 150 }
  ]

  for (const service of services) {
    await prisma.service.create({
      data: {
        name: service.name,
        description: service.desc,
        price: service.price,
        duration: service.duration
      }
    })
  }

  // Criar manutenções
  console.log('🔨 Criando manutenções...')
  const maintenances = [
    {
      vehicleId: vehicle1.id,
      type: 'PREVENTIVE' as const,
      status: 'COMPLETED' as const,
      description: 'Troca de óleo e filtros - Revisão 40.000km - Oficina Central',
      scheduledDate: new Date('2024-01-15'),
      completedDate: new Date('2024-01-15'),
      cost: 280.00,
      notes: 'Óleo sintético 5W30. Filtros de óleo, ar e combustível substituídos.'
    },
    {
      vehicleId: vehicle1.id,
      type: 'CORRECTIVE' as const,
      status: 'COMPLETED' as const,
      description: 'Reparo no sistema de freios - Auto Peças Silva',
      scheduledDate: new Date('2024-03-20'),
      completedDate: new Date('2024-03-21'),
      cost: 420.00,
      notes: 'Substituídas pastilhas dianteiras e traseiras. Fluido de freio trocado.'
    },
    {
      vehicleId: vehicle2.id,
      type: 'PREVENTIVE' as const,
      status: 'COMPLETED' as const,
      description: 'Revisão geral 50.000km - Concessionária Honda',
      scheduledDate: new Date('2024-02-10'),
      completedDate: new Date('2024-02-10'),
      cost: 450.00,
      notes: 'Revisão completa conforme manual do fabricante.'
    },
    {
      vehicleId: vehicle3.id,
      type: 'CORRECTIVE' as const,
      status: 'IN_PROGRESS' as const,
      description: 'Reparo na suspensão dianteira - Auto Center',
      scheduledDate: new Date('2024-06-25'),
      cost: 350.00,
      notes: 'Amortecedores e molas em substituição.'
    },
    {
      vehicleId: vehicle4.id,
      type: 'INSPECTION' as const,
      status: 'SCHEDULED' as const,
      description: 'Inspeção veicular anual - Centro de Vistoria',
      scheduledDate: new Date('2024-07-15'),
      cost: 80.00
    },
    {
      vehicleId: vehicle5.id,
      type: 'PREVENTIVE' as const,
      status: 'SCHEDULED' as const,
      description: 'Revisão 15.000km - Moto Peças Yamaha',
      scheduledDate: new Date('2024-07-01'),
      cost: 150.00
    },
    {
      vehicleId: vehicle6.id,
      type: 'CORRECTIVE' as const,
      status: 'SCHEDULED' as const,
      description: 'Reparo no sistema elétrico - Elétrica do João',
      scheduledDate: new Date('2024-06-30'),
      cost: 280.00
    }
  ]

  for (const maintenance of maintenances) {
    await prisma.maintenance.create({ data: maintenance })
  }

  // Criar lembretes
  console.log('⏰ Criando lembretes...')
  const reminders = [
    {
      vehicleId: vehicle1.id,
      description: 'Revisão dos 50.000km',
      type: 'MILEAGE_BASED' as const,
      dueMileage: 50000,
      intervalMileage: 10000,
      completed: false,
      recurring: true
    },
    {
      vehicleId: vehicle1.id,
      description: 'Vencimento do IPVA',
      type: 'TIME_BASED' as const,
      dueDate: new Date('2025-01-31'),
      intervalDays: 365,
      completed: false,
      recurring: true
    },
    {
      vehicleId: vehicle2.id,
      description: 'Troca de pneus',
      type: 'TIME_BASED' as const,
      dueDate: new Date('2024-08-15'),
      completed: false,
      recurring: false
    },
    {
      vehicleId: vehicle3.id,
      description: 'Revisão geral',
      type: 'HYBRID' as const,
      dueDate: new Date('2024-09-01'),
      dueMileage: 70000,
      intervalDays: 180,
      intervalMileage: 10000,
      completed: false,
      recurring: true
    },
    {
      vehicleId: vehicle4.id,
      description: 'Primeira revisão',
      type: 'MILEAGE_BASED' as const,
      dueMileage: 30000,
      completed: false,
      recurring: false
    },
    {
      vehicleId: vehicle5.id,
      description: 'Troca de óleo - Moto',
      type: 'MILEAGE_BASED' as const,
      dueMileage: 18000,
      intervalMileage: 3000,
      completed: false,
      recurring: true
    }
  ]

  for (const reminder of reminders) {
    await prisma.reminder.create({ data: reminder })
  }

  // Criar despesas
  console.log('💰 Criando despesas...')
  const expenses = [
    // Vehicle 1 expenses
    { vehicleId: vehicle1.id, desc: 'Óleo sintético 5W30', category: 'Manutenção', amount: 85.00, date: new Date('2024-01-15'), mileage: 42000 },
    { vehicleId: vehicle1.id, desc: 'Filtro de óleo', category: 'Peças', amount: 25.00, date: new Date('2024-01-15'), mileage: 42000 },
    { vehicleId: vehicle1.id, desc: 'Filtro de ar', category: 'Peças', amount: 45.00, date: new Date('2024-01-15'), mileage: 42000 },
    { vehicleId: vehicle1.id, desc: 'Pastilhas de freio dianteiras', category: 'Peças', amount: 180.00, date: new Date('2024-03-20'), mileage: 44000 },
    { vehicleId: vehicle1.id, desc: 'Fluido de freio DOT4', category: 'Fluidos', amount: 35.00, date: new Date('2024-03-20'), mileage: 44000 },
    { vehicleId: vehicle1.id, desc: 'Combustível', category: 'Combustível', amount: 95.00, date: new Date('2024-06-01'), mileage: 45000 },

    // Vehicle 2 expenses  
    { vehicleId: vehicle2.id, desc: 'Revisão completa', category: 'Manutenção', amount: 450.00, date: new Date('2024-02-10'), mileage: 50000 },
    { vehicleId: vehicle2.id, desc: 'Combustível', category: 'Combustível', amount: 110.00, date: new Date('2024-05-15'), mileage: 51500 },
    { vehicleId: vehicle2.id, desc: 'Lavagem completa', category: 'Limpeza', amount: 25.00, date: new Date('2024-05-20'), mileage: 51600 },

    // Vehicle 3 expenses
    { vehicleId: vehicle3.id, desc: 'Amortecedores dianteiros', category: 'Peças', amount: 280.00, date: new Date('2024-06-25'), mileage: 68000 },
    { vehicleId: vehicle3.id, desc: 'Molas da suspensão', category: 'Peças', amount: 150.00, date: new Date('2024-06-25'), mileage: 68000 },
    { vehicleId: vehicle3.id, desc: 'Combustível', category: 'Combustível', amount: 75.00, date: new Date('2024-06-20'), mileage: 67800 },

    // Vehicle 4 expenses
    { vehicleId: vehicle4.id, desc: 'Seguro anual', category: 'Seguro', amount: 1200.00, date: new Date('2024-01-01'), mileage: 20000 },
    { vehicleId: vehicle4.id, desc: 'IPVA 2024', category: 'Impostos', amount: 450.00, date: new Date('2024-02-01'), mileage: 21000 },
    { vehicleId: vehicle4.id, desc: 'Combustível', category: 'Combustível', amount: 85.00, date: new Date('2024-06-10'), mileage: 24500 },

    // Vehicle 5 expenses (Moto)
    { vehicleId: vehicle5.id, desc: 'Óleo 10W40 para moto', category: 'Manutenção', amount: 45.00, date: new Date('2024-04-01'), mileage: 12000 },
    { vehicleId: vehicle5.id, desc: 'Pneu traseiro', category: 'Peças', amount: 120.00, date: new Date('2024-05-01'), mileage: 13000 },
    { vehicleId: vehicle5.id, desc: 'Combustível', category: 'Combustível', amount: 35.00, date: new Date('2024-06-15'), mileage: 14500 },

    // Vehicle 6 expenses (Van)
    { vehicleId: vehicle6.id, desc: 'Óleo diesel 15W40', category: 'Manutenção', amount: 150.00, date: new Date('2024-03-01'), mileage: 90000 },
    { vehicleId: vehicle6.id, desc: 'Filtro de combustível', category: 'Peças', amount: 65.00, date: new Date('2024-03-01'), mileage: 90000 },
    { vehicleId: vehicle6.id, desc: 'Combustível diesel', category: 'Combustível', amount: 180.00, date: new Date('2024-06-01'), mileage: 94000 }
  ]

  for (const expense of expenses) {
    await prisma.expense.create({
      data: {
        vehicleId: expense.vehicleId,
        description: expense.desc,
        category: expense.category,
        amount: expense.amount,
        date: expense.date,
        mileage: expense.mileage
      }
    })
  }

  // Criar notificações
  console.log('🔔 Criando notificações...')
  const notifications = [
    {
      userId: owner1.id,
      type: 'MAINTENANCE_DUE' as const,
      title: 'Manutenção Próxima',
      message: 'Seu Toyota Corolla está próximo da revisão dos 50.000km',
      channel: 'IN_APP' as const,
      read: false
    },
    {
      userId: owner1.id,
      type: 'REMINDER_DUE' as const,
      title: 'IPVA Vencendo',
      message: 'O IPVA do seu veículo ABC-1234 vence em 30 dias',
      channel: 'EMAIL' as const,
      read: false
    },
    {
      userId: owner2.id,
      type: 'EXPENSE_LIMIT' as const,
      title: 'Limite de Gastos',
      message: 'Você atingiu 80% do seu limite mensal de gastos',
      channel: 'PUSH' as const,
      read: true
    },
    {
      userId: owner3.id,
      type: 'MILEAGE_ALERT' as const,
      title: 'Quilometragem Alta',
      message: 'Sua van Mercedes está com alta quilometragem, considere uma revisão',
      channel: 'IN_APP' as const,
      read: false
    }
  ]

  for (const notification of notifications) {
    await prisma.notification.create({ data: notification })
  }

  console.log('✅ Seed executado com sucesso!')
  console.log('')
  console.log('📊 Dados criados:')
  console.log('👥 Usuários: 3 (1 Admin, 3 Proprietários)')
  console.log('🚗 Veículos: 6 (4 Carros, 1 Moto, 1 Van)')
  console.log('🔧 Serviços: 8')
  console.log('🔨 Manutenções: 7 (3 Concluídas, 1 Em Progresso, 3 Agendadas)')
  console.log('⏰ Lembretes: 6')
  console.log('💰 Despesas: 21')
  console.log('🔔 Notificações: 4')
  console.log('📊 Registros de Quilometragem: 6')
  console.log('⚙️ Configurações: 2')
  console.log('')
  console.log('🔑 Credenciais de acesso (senha: 123456):')
  console.log('• Admin: admin@oficina.com')
  console.log('• Cliente 1: cliente1@email.com')
  console.log('• Cliente 2: cliente2@email.com')
  console.log('• Cliente 3: cliente3@email.com')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const { User, Checkin, Class } = require("./models");

// Sample data
const sampleUsers = [
  {
    name: "João Silva",
    email: "aluno@gb.com",
    password: "123456",
    type: "student",
    belt: "AZUL",
    degrees: 2,
    birthDate: new Date("1995-05-15"),
    lastGraduation: new Date("2025-06-10"),
    nextGraduation: new Date("2026-06-10"),
  },
  {
    name: "Admin Gracie Barra",
    email: "admin@gb.com",
    password: "123456",
    type: "admin",
    belt: "PRETA",
    degrees: 1,
    birthDate: new Date("1985-01-01"),
    lastGraduation: new Date("2020-01-01"),
    nextGraduation: new Date("2027-01-01"),
  },
  {
    name: "Maria Santos",
    email: "maria@gb.com",
    password: "123456",
    type: "student",
    belt: "BRANCA",
    degrees: 1,
    birthDate: new Date("1998-03-20"),
    lastGraduation: new Date("2025-11-05"),
    nextGraduation: new Date("2026-05-05"),
  },
  {
    name: "Pedro Costa",
    email: "pedro@gb.com",
    password: "123456",
    type: "student",
    belt: "ROXA",
    degrees: 3,
    birthDate: new Date("1992-08-10"),
    lastGraduation: new Date("2024-09-15"),
    nextGraduation: new Date("2026-09-15"),
  },
  {
    name: "Ana Oliveira",
    email: "ana@gb.com",
    password: "123456",
    type: "student",
    belt: "BRANCA",
    degrees: 0,
    birthDate: new Date("2000-12-01"),
    lastGraduation: new Date("2026-01-10"),
    nextGraduation: new Date("2026-07-10"),
  },
];

const sampleClasses = [
  {
    name: "GB1 Fundamental",
    time: "06:00",
    weekdays: [1, 3, 5], // Segunda, Quarta, Sexta
    level: "GB1",
    instructor: "Professor Carlos",
    maxStudents: 30,
  },
  {
    name: "GB2 Avançado",
    time: "07:00",
    weekdays: [1, 3, 5],
    level: "GB2",
    instructor: "Professor Carlos",
    maxStudents: 25,
  },
  {
    name: "GB Kids",
    time: "12:00",
    weekdays: [1, 2, 3, 4, 5],
    level: "Kids",
    instructor: "Professora Juliana",
    maxStudents: 20,
  },
  {
    name: "GB1 Fundamental",
    time: "18:00",
    weekdays: [1, 2, 3, 4, 5],
    level: "GB1",
    instructor: "Professor Roberto",
    maxStudents: 35,
  },
  {
    name: "GB2 Avançado",
    time: "19:00",
    weekdays: [1, 2, 3, 4, 5],
    level: "GB2",
    instructor: "Professor Roberto",
    maxStudents: 30,
  },
  {
    name: "GB All Levels",
    time: "20:00",
    weekdays: [1, 2, 3, 4, 5],
    level: "All Levels",
    instructor: "Professor Roberto",
    maxStudents: 40,
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Checkin.deleteMany({});
    await Class.deleteMany({});

    // Create users
    console.log("👥 Creating users...");
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create classes
    console.log("📚 Creating classes...");
    const createdClasses = await Class.insertMany(sampleClasses);
    console.log(`✅ Created ${createdClasses.length} classes`);

    // Create some sample check-ins
    console.log("✓ Creating sample check-ins...");
    const student = createdUsers.find((u) => u.type === "student");
    const sampleCheckins = [
      {
        user: student._id,
        classId: 1,
        className: "GB2 Avançado",
        time: "19:00",
        date: new Date(),
        status: "pending",
      },
      {
        user: student._id,
        classId: 2,
        className: "GB1 Fundamental",
        time: "18:00",
        date: new Date(Date.now() - 86400000), // Yesterday
        status: "confirmed",
      },
      {
        user: student._id,
        classId: 3,
        className: "GB All Levels",
        time: "20:00",
        date: new Date(Date.now() - 2 * 86400000), // 2 days ago
        status: "confirmed",
      },
    ];

    const createdCheckins = await Checkin.insertMany(sampleCheckins);
    console.log(`✅ Created ${createdCheckins.length} check-ins`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📝 Test Accounts:");
    console.log("   Student: aluno@gb.com / 123456");
    console.log("   Admin: admin@gb.com / 123456");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run seed
seedDatabase();

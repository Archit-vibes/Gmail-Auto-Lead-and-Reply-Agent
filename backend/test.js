const prisma = require('./src/config/prisma');

async function test() {
  try {
     console.log("Connecting...");
     const payload = {
        sub: "test_sub_" + Date.now(),
        email: "test@example.com"
     };
     const user = await prisma.user.upsert({
      where: { email: payload.email },
      update: {
        accessToken: "some_access",
        refreshToken: "",
      },
      create: {
        googleID: payload.sub,
        email: payload.email,
        accessToken: "some_access",
        refreshToken: "",
      }
    });
    console.log("Upsert Success", user);
  } catch(err) {
    console.error("Upsert Failed", err);
  } finally {
     await prisma.$disconnect();
  }
}
test();

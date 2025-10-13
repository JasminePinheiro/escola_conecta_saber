import { connect, connection } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/escola_conecta_saber';

async function seedAdmin() {
  try {
    await connect(MONGO_URI);

    if (!connection.db) {
      throw new Error('Conexão com o banco de dados não foi estabelecida');
    }

    const existingAdmin = await connection.db
      .collection('users')
      .findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('Já existe um usuário admin cadastrado:');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Nome: ${existingAdmin.name}`);
      console.log(
        '\nSe você deseja criar outro admin ou alterar este, faça manualmente no banco.',
      );
      await connection.close();
      return;
    }

    const adminData = {
      email: 'admin@escola.com',
      name: 'Administrador',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await connection.db.collection('users').insertOne(adminData);

    console.log('\nAdmin criado com sucesso!');
    console.log('Email: admin@escola.com');
    console.log('Senha: admin123');
    console.log('\nIMPORTANTE: Altere a senha após o primeiro login!');
  } catch (error) {
    console.error('Erro ao criar admin:', error);
  } finally {
    await connection.close();
    console.log('\nConexão com MongoDB encerrada');
  }
}

seedAdmin();

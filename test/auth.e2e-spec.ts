import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<any>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    userModel = moduleFixture.get(getModelToken('User'));

    await app.init();
  });

  afterAll(async () => {
    await userModel.deleteMany({ 
      email: { $regex: '.*@example\\.com$' } 
    });
    await app.close();
  });

  afterEach(async () => {
    await userModel.deleteMany({ email: { $regex: 'test.*@example.com' } });
  });

  describe('/auth/register (POST)', () => {
    it('should register a new student', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'teststudent@example.com',
          name: 'Test Student',
          password: 'password123',
          role: 'student',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toBe('teststudent@example.com');
          expect(res.body.user.role).toBe('student');
        });
    });

    it('should register a new teacher', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'testteacher@example.com',
          name: 'Test Teacher',
          password: 'password123',
          role: 'teacher',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.user.role).toBe('teacher');
        });
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        email: 'testduplicate@example.com',
        name: 'Test User',
        password: 'password123',
        role: 'student',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(409);
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          name: 'Test User',
          password: 'password123',
        })
        .expect(400);
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'testshort@example.com',
          name: 'Test User',
          password: '123',
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      await userModel.deleteMany({ email: 'testlogin@example.com' });
      
      const res = await request(app.getHttpServer()).post('/auth/register').send({
        email: 'testlogin@example.com',
        name: 'Test Login User',
        password: 'password123',
        role: 'student',
      });
      expect(res.status).toBe(201);
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'testlogin@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should fail with wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'testlogin@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail with non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('/auth/profile (GET)', () => {
    let accessToken: string;

    beforeEach(async () => {
      await userModel.deleteMany({ email: 'testprofile@example.com' });
      
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'testprofile@example.com',
          name: 'Test Profile User',
          password: 'password123',
          role: 'student',
        });

      accessToken = response.body.accessToken;
    });

    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('testprofile@example.com');
          expect(res.body).toHaveProperty('id');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/auth/profile (PATCH)', () => {
    let accessToken: string;

    beforeEach(async () => {
      await userModel.deleteMany({ email: 'testupdate@example.com' });
      
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'testupdate@example.com',
          name: 'Test Update User',
          password: 'password123',
          role: 'student',
        });

      accessToken = response.body.accessToken;
    });

    it('should update user name', () => {
      return request(app.getHttpServer())
        .patch('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Name',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Name');
        });
    });

    it('should update user email', () => {
      return request(app.getHttpServer())
        .patch('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'testupdated@example.com',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('testupdated@example.com');
        });
    });
  });

  describe('/auth/change-password (PATCH)', () => {
    let accessToken: string;

    beforeEach(async () => {
      await userModel.deleteMany({ email: 'testpassword@example.com' });
      
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'testpassword@example.com',
          name: 'Test Password User',
          password: 'oldpassword123',
          role: 'student',
        });

      accessToken = response.body.accessToken;
    });

    it('should change password', async () => {
      await request(app.getHttpServer())
        .patch('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'oldpassword123',
          newPassword: 'newpassword123',
        })
        .expect(204);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'testpassword@example.com',
          password: 'newpassword123',
        })
        .expect(200);
    });

    it('should fail with wrong current password', () => {
      return request(app.getHttpServer())
        .patch('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        })
        .expect(401);
    });
  });
});

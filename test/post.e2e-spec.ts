import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

describe('Posts (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<any>;
  let postModel: Model<any>;
  let studentToken: string;
  let teacherToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    userModel = moduleFixture.get(getModelToken('User'));
    postModel = moduleFixture.get(getModelToken('Post'));

    await app.init();

    // Create test users
    const studentRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'student@example.com',
        name: 'Test Student',
        password: 'password123',
        role: 'student',
      });
    studentToken = studentRes.body.accessToken;

    const teacherRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'teacher@example.com',
        name: 'Test Teacher',
        password: 'password123',
        role: 'teacher',
      });
    teacherToken = teacherRes.body.accessToken;

    // Create admin manually
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const admin = await userModel.create({
      email: 'admin@example.com',
      name: 'Test Admin',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });

    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
      });
    adminToken = adminRes.body.accessToken;
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    await postModel.deleteMany({});
    await app.close();
  });

  beforeEach(async () => {
    await postModel.deleteMany({});
  });

  describe('/posts (POST)', () => {
    it('should create a post as teacher', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Test Post',
          content: 'This is a test post content',
          tags: ['test', 'example'],
          published: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Test Post');
          expect(res.body.author).toBe('Test Teacher');
          expect(res.body.tags).toEqual(['test', 'example']);
        });
    });

    it('should create a post as admin', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Post',
          content: 'Admin post content',
          published: true,
        })
        .expect(201);
    });

    it('should fail to create post as student', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Student Post',
          content: 'This should fail',
          published: true,
        })
        .expect(403);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({
          title: 'Unauthorized Post',
          content: 'This should fail',
        })
        .expect(401);
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: '',
          content: 'Content without title',
        })
        .expect(400);
    });
  });

  describe('/posts (GET)', () => {
    beforeEach(async () => {
      // Create some test posts
      await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Published Post 1',
          content: 'Content 1',
          published: true,
        });

      await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Published Post 2',
          content: 'Content 2',
          published: true,
        });

      await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Draft Post',
          content: 'Draft content',
          published: false,
        });
    });

    it('should list published posts (public access)', () => {
      return request(app.getHttpServer())
        .get('/posts')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(res.body.data.length).toBe(2);
        });
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('/posts?page=1&limit=1')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(1);
          expect(res.body.totalPages).toBe(2);
        });
    });
  });

  describe('/posts/all (GET)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Published Post',
          content: 'Published content',
          published: true,
        });

      await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Draft Post',
          content: 'Draft content',
          published: false,
        });
    });

    it('should list all posts for teachers', () => {
      return request(app.getHttpServer())
        .get('/posts/all')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(2);
        });
    });

    it('should fail for students', () => {
      return request(app.getHttpServer())
        .get('/posts/all')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('/posts/search (GET)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'JavaScript Tutorial',
          content: 'Learn JavaScript basics',
          tags: ['javascript', 'programming'],
          published: true,
        });

      await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Python Guide',
          content: 'Python for beginners',
          tags: ['python', 'programming'],
          published: true,
        });
    });

    it('should search posts by title', () => {
      return request(app.getHttpServer())
        .get('/posts/search?query=JavaScript')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(1);
          expect(res.body.data[0].title).toContain('JavaScript');
        });
    });

    it('should search posts by content', () => {
      return request(app.getHttpServer())
        .get('/posts/search?query=beginners')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(1);
          expect(res.body.data[0].content).toContain('beginners');
        });
    });

    it('should search posts by tags', () => {
      return request(app.getHttpServer())
        .get('/posts/search?query=programming')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(2);
        });
    });
  });

  describe('/posts/:id (GET)', () => {
    let postId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Test Post',
          content: 'Test content',
          published: true,
        });
      postId = res.body.id;
    });

    it('should get post by id', () => {
      return request(app.getHttpServer())
        .get(`/posts/${postId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(postId);
          expect(res.body.title).toBe('Test Post');
        });
    });

    it('should return 404 for non-existent post', () => {
      return request(app.getHttpServer())
        .get('/posts/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });

  describe('/posts/:id (PATCH)', () => {
    let postId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Original Title',
          content: 'Original content',
          published: true,
        });
      postId = res.body.id;
    });

    it('should update post as teacher', () => {
      return request(app.getHttpServer())
        .patch(`/posts/${postId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Updated Title',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated Title');
          expect(res.body.content).toBe('Original content');
        });
    });

    it('should fail to update post as student', () => {
      return request(app.getHttpServer())
        .patch(`/posts/${postId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Hacked Title',
        })
        .expect(403);
    });
  });

  describe('/posts/:id (DELETE)', () => {
    let postId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'To Delete',
          content: 'This will be deleted',
          published: true,
        });
      postId = res.body.id;
    });

    it('should delete post as teacher', async () => {
      await request(app.getHttpServer())
        .delete(`/posts/${postId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(204);

      return request(app.getHttpServer()).get(`/posts/${postId}`).expect(404);
    });

    it('should fail to delete post as student', () => {
      return request(app.getHttpServer())
        .delete(`/posts/${postId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });
});

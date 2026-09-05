import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { CacheControlInterceptor } from '../src/common/interceptors/cache-control.interceptor';

// These hit the real app (real DB connection, real guards, real validation
// pipe) rather than mocks — deliberately restricted to read-only/public GET
// endpoints and auth-rejection checks, and skips CORS/CSRF/cookie middleware
// (irrelevant to a same-process supertest call), so running this suite never
// creates or mutates real data in whatever database it's pointed at.
describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const reflector = app.get(Reflector);
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new CacheControlInterceptor(reflector));
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('GET /products returns a paginated list shape', async () => {
    const res = await request(app.getHttpServer()).get('/products').expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /products respects a limit query param', async () => {
    const res = await request(app.getHttpServer())
      .get('/products?limit=2')
      .expect(200);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
  });

  it('GET /modules returns only active modules as a plain array', async () => {
    const res = await request(app.getHttpServer()).get('/modules').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    for (const mod of res.body) {
      expect(mod.isActive).not.toBe(false);
    }
  });

  it('GET /products/:slug 404s for a slug that does not exist', () => {
    return request(app.getHttpServer())
      .get('/products/this-slug-should-never-exist-e2e')
      .expect(404);
  });

  it('rejects an unauthenticated request to an admin-only route', () => {
    return request(app.getHttpServer()).get('/admin/users').expect(401);
  });

  it('rejects an unauthenticated request to a customer-authenticated route', () => {
    return request(app.getHttpServer()).get('/orders').expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});

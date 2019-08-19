/* eslint-disable no-console */
process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');

const app = require('../../server/app');
const { createConnect, close } = require('../../server/config/db');

describe('POST /student/create', () => {
  before(() => {
    createConnect();
  });

  // eslint-disable-next-line no-undef
  after(() => {
    close();
  });

  it('OK, creating a student works', () => {
    request(app).post('/api/student/create')
      .send({
        phone: '9631560285',
        password: '12345',
      })
      .then((res) => {
        const body = res.body;
        console.log('body', body);
        expect(body).to.contain.property('user');
        expect(body).to.contain.property('token');
      });
  });
});


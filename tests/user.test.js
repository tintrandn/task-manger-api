const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userThreeId, userThree, setupUserDatabase } = require('./fixtures/db')

beforeEach(setupUserDatabase)

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: "TeeTee4",
        email: "abc4@gmail.com",
        password: "Testing@123"

    }).expect(201)
    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    // Assertions about the response
    // expect(response.body.user.name).toBe('TeeTee2')
    expect(response.body).toMatchObject({
        user: {
            name: "TeeTee4",
            email: "abc4@gmail.com"
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('Testing@123')
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userThree.email,
        password: userThree.password
    }).expect(200)

    const user = await User.findById(response.body.user._id)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: userThree.email,
        password: 'wrong password'
    }).expect(400)
})

test('Should get profile for user', async () => {
 
    await request(app)
        .get('/users/me')
        .set('Authorization', 'Bearer ' + userThree.tokens[0].token)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', 'Bearer ' + userThree.tokens[0].token)
        .send()
        .expect(200)

    const user = await User.findById(userThreeId)
    expect(user).toBeNull()
})

test('Should not delete for authenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', 'Bearer ' + userThree.tokens[0].token)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userThreeId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user files', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', 'Bearer ' + userThree.tokens[0].token)
        .send({
            name: 'Jess'
        })
        .expect(200)
    const user = await User.findById(userThreeId)
    expect(user.name).toEqual('Jess')
})

test('Should not update invalid user files', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', 'Bearer ' + userThree.tokens[0].token)
        .send({
            location: 'Da Nang'
        })
        .expect(400)
})


//== Test Suite: Game API Server ===============================================

//-- Dependencies --------------------------------
const request = require('supertest');
const config     = require('./config.js'     );
const dataAccess = require('./data_access.js');
const API        = require('./server.js'     );


//== Tests =====================================================================

describe('Test Game API Server', () => {

//-- Test Get Games Endpoint ---------------------
    describe('Test Retrieve Games', () => {
        // Constants
        const endPoint = config.URL_API_GAMES;
        // Configuration
        beforeEach(async function () {
            await dataAccess.clear();
            await dataAccess.create({
                [config.FIELD_TITLE]: 'Test Game 1',
                [config.FIELD_GENRE]: 'Test Genre' ,
            });
            await dataAccess.create({
                [config.FIELD_TITLE]: 'Test Game 2',
                [config.FIELD_GENRE]: 'Test Genre' ,
            });
        });
        // Behavior Tests
        it('responds with status code 200', async function () {
            const response = await request(API).get(endPoint);
            expect(response.status).toBe(200);
        });
        it('responds with JSON object', async function () {
            const response = await request(API).get(endPoint);
            expect(response.type).toBe('application/json');
        });
        it('responds with Array', async function () {
            const response = await request(API).get(endPoint);
            const gamesList = response.body.games;
            expect(Array.isArray(gamesList)).toBeTruthy();
        });
        it('responds with all game objects', async function () {
            const response = await request(API).get(endPoint);
            const gamesList = response.body.games;
            expect(gamesList.length).toBe(2);
        });
        it('responds with correct data for each game', async function () {
            const response = await request(API).get(endPoint);
            const testGame = response.body.games[0];
            expect(testGame).toEqual({
                [config.FIELD_ID   ]: 1            ,
                [config.FIELD_TITLE]: 'Test Game 1',
                [config.FIELD_GENRE]: 'Test Genre' ,
            });
        });
    });

    //-- Test Get Game By ID Endpoint ----------------
    describe('Test Retrieve Game by ID', () => {
        // Constants
        const endPoint = `${config.URL_API_GAMES}/2`;
        // Configuration
        beforeEach(async function () {
            await dataAccess.clear();
            await dataAccess.create({
                [config.FIELD_TITLE]: 'Test Game 1',
                [config.FIELD_GENRE]: 'Test Genre' ,
            });
            await dataAccess.create({
                [config.FIELD_TITLE]: 'Test Game 2',
                [config.FIELD_GENRE]: 'Test Genre' ,
            });
        });
        // Behavior Tests
        it('responds with status code 200', async function () {
            const response = await request(API).get(endPoint);
            expect(response.status).toBe(200);
        });
        it('checks for unknown game (404)', async function () {
            const unknown = `${config.URL_API_GAMES}/3`;
            const response = await request(API).get(unknown);
            expect(response.status).toBe(404);
            expect(response.body.message).toBe(config.ERROR_NOTFOUND);
        });
        it('responds with JSON object', async function () {
            const response = await request(API).get(endPoint);
            expect(response.type).toBe('application/json');
        });
        it('responds with correct data', async function () {
            const response = await request(API).get(endPoint);
            const testGame = response.body;
            expect(testGame).toEqual({
                [config.FIELD_ID   ]: 2            ,
                [config.FIELD_TITLE]: 'Test Game 2',
                [config.FIELD_GENRE]: 'Test Genre' ,
            });
        });
    });
    
    //-- Test Post (create) Game Endpoint ------------
    describe('Test Create Game', () => {
        // Constants
        const endPoint = config.URL_API_GAMES;
        const testGame = {
            [config.FIELD_TITLE]: 'Test Game' ,
            [config.FIELD_GENRE]: 'Test Genre',
        };
        // Configuration
        beforeEach(async function () {
            await dataAccess.clear();
        });
        // Behavior Tests
        it('responds with status code 201', async function () {
            let response = await request(API).post(endPoint).send(testGame);
            expect(response.status).toBe(201);
        });
        it('checks for incorrect data (422)', async function () {
            let response = await request(API).post(endPoint).send({});
            expect(response.status).toBe(422);
            expect(response.body.message).toBe(config.ERROR_DATAINCOMPLETE);
        });
        it('checks for title coflict (405)', async function () {
            await request(API).post(endPoint).send(testGame);
            let response = await request(API).post(endPoint).send(testGame);
            expect(response.status).toBe(405);
            expect(response.body.message).toBe(config.ERROR_TITLECONFLICT);
        });
        it('responds with JSON object', async function () {
            let response = await request(API).post(endPoint).send(testGame);
            expect(response.type).toBe(config.MIME_APPLICATION_JSON);
        });
        it('responds with id of created game', async function () {
            let response = await request(API).post(endPoint).send(testGame);
            expect(response.body).toEqual({
                [config.FIELD_ID]: 1,
            });
        });
    });
    
    //-- Test Delete Game Endpoint -------------------
    describe('Test Delete Game', () => {
        // Constants
        const endPoint = `${config.URL_API_GAMES}/1`;
        // Configuration
        beforeEach(async function () {
            await dataAccess.clear();
            await dataAccess.create({
                [config.FIELD_TITLE]: 'Test Game' ,
                [config.FIELD_GENRE]: 'Test Genre',
            });
        });
        // Behavior Tests
        it('responds with status code 200', async function () {
            let response = await request(API).delete(endPoint);
            expect(response.status).toBe(200);
        });
        it('checks for incorrect id (404)', async function () {
            const wrongEndPoint = `${config.URL_API_GAMES}/5`;
            let response = await request(API).delete(wrongEndPoint);
            expect(response.status).toBe(404);
            expect(response.body.message).toBe(config.ERROR_NOTFOUND);
            await request(API).delete(endPoint);
            response = await request(API).delete(endPoint);
            expect(response.status).toBe(404);
            expect(response.body.message).toBe(config.ERROR_NOTFOUND);
        });
        it('responds with JSON object', async function () {
            await request(API).delete(endPoint);
            let response = await request(API).delete(endPoint);
            expect(response.type).toBe(config.MIME_APPLICATION_JSON);
        });
        it('responds with deleted game', async function () {
            let response = await request(API).delete(endPoint);
            expect(response.body).toEqual({
                [config.FIELD_ID]   : 1           ,
                [config.FIELD_TITLE]: 'Test Game' ,
                [config.FIELD_GENRE]: 'Test Genre',
            });
        });
    });
});

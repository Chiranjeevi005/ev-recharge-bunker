"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
exports.closeDatabaseConnection = closeDatabaseConnection;
exports.getDatabase = getDatabase;
var mongodb_1 = require("mongodb");
// Default configuration
var DEFAULT_RETRY_ATTEMPTS = 3;
var DEFAULT_RETRY_DELAY = 1000; // 1 second
var DEFAULT_CONNECTION_TIMEOUT = 10000; // 10 seconds
var DEFAULT_SOCKET_TIMEOUT = 20000; // 20 seconds
// MongoDB connection URI from environment variables
var MONGODB_URI = process.env['DATABASE_URL'] || process.env['MONGODB_URI'] || 'mongodb://localhost:27017';
// Global variables to cache the client and connection state
var cachedClient = null;
var cachedDb = null;
/**
 * Simple logger function
 */
function log(message) {
    var optionalParams = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        optionalParams[_i - 1] = arguments[_i];
    }
    console.log.apply(console, __spreadArray(["[DB Connection] ".concat(message)], optionalParams, false));
}
/**
 * Creates a MongoDB client with retry logic and timeout configuration
 */
function connectToDatabase() {
    return __awaiter(this, arguments, void 0, function (retries, retryDelay) {
        var options, _loop_1, attempt, state_1;
        if (retries === void 0) { retries = DEFAULT_RETRY_ATTEMPTS; }
        if (retryDelay === void 0) { retryDelay = DEFAULT_RETRY_DELAY; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Return cached connection if available
                    if (cachedClient && cachedDb) {
                        log('Returning cached connection');
                        return [2 /*return*/, { client: cachedClient, db: cachedDb }];
                    }
                    options = {
                        serverSelectionTimeoutMS: DEFAULT_CONNECTION_TIMEOUT,
                        connectTimeoutMS: DEFAULT_CONNECTION_TIMEOUT,
                        socketTimeoutMS: DEFAULT_SOCKET_TIMEOUT,
                        maxIdleTimeMS: 30000, // 30 seconds
                        maxPoolSize: 10,
                        minPoolSize: 5,
                        waitQueueTimeoutMS: 5000 // 5 seconds
                    };
                    _loop_1 = function (attempt) {
                        var connectionPromise, client, db_1, collectionsPromise, collections, collectionsError_1, error_1, mockDb;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 6, , 8]);
                                    log("Connecting to MongoDB (attempt ".concat(attempt, "/").concat(retries, ")"));
                                    log("Using MongoDB URI: ".concat(MONGODB_URI));
                                    connectionPromise = new Promise(function (resolve, reject) {
                                        var client = new mongodb_1.MongoClient(MONGODB_URI, options);
                                        client.connect()
                                            .then(function () {
                                            log('MongoDB client connected successfully');
                                            resolve(client);
                                        })
                                            .catch(reject);
                                        // Add timeout to reject if connection takes too long
                                        setTimeout(function () {
                                            log('MongoDB connection timeout - rejecting promise');
                                            reject(new Error('MongoDB connection timeout'));
                                        }, DEFAULT_CONNECTION_TIMEOUT);
                                    });
                                    return [4 /*yield*/, connectionPromise];
                                case 1:
                                    client = _b.sent();
                                    db_1 = client.db();
                                    log("Connected to database: ".concat(db_1.databaseName));
                                    collectionsPromise = new Promise(function (resolve, reject) {
                                        db_1.listCollections().toArray()
                                            .then(resolve)
                                            .catch(reject);
                                        // Add timeout to reject if listing takes too long
                                        setTimeout(function () {
                                            log('MongoDB collections list timeout - rejecting promise');
                                            reject(new Error('MongoDB collections list timeout'));
                                        }, 5000);
                                    });
                                    _b.label = 2;
                                case 2:
                                    _b.trys.push([2, 4, , 5]);
                                    return [4 /*yield*/, collectionsPromise];
                                case 3:
                                    collections = _b.sent();
                                    log("Available collections:", collections.map(function (c) { return c.name; }));
                                    return [3 /*break*/, 5];
                                case 4:
                                    collectionsError_1 = _b.sent();
                                    log('Warning: Could not list collections, but connection is still valid', collectionsError_1);
                                    return [3 /*break*/, 5];
                                case 5:
                                    // Cache the connection
                                    cachedClient = client;
                                    cachedDb = db_1;
                                    log('Successfully connected to MongoDB');
                                    return [2 /*return*/, { value: { client: client, db: db_1 } }];
                                case 6:
                                    error_1 = _b.sent();
                                    log("MongoDB connection attempt ".concat(attempt, " failed:"), error_1);
                                    // If this is the last attempt, throw the error
                                    if (attempt === retries) {
                                        log("Failed to connect to MongoDB after ".concat(retries, " attempts"));
                                        // Don't throw an error that would crash the app, just return a mock connection
                                        // This allows the app to continue running even if DB is not available
                                        log('Returning mock connection to allow app to continue');
                                        mockDb = {
                                            collection: function (name) { return ({
                                                findOne: function () { return null; },
                                                find: function () { return ({ toArray: function () { return Promise.resolve([]); } }); },
                                                insertOne: function () { return Promise.resolve({ insertedId: 'mock' }); },
                                                updateOne: function () { return Promise.resolve({ modifiedCount: 0 }); },
                                                deleteOne: function () { return Promise.resolve({ deletedCount: 0 }); }
                                            }); }
                                        };
                                        return [2 /*return*/, { value: {
                                                    client: {},
                                                    db: mockDb
                                                } }];
                                    }
                                    // Wait before retrying
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, retryDelay); })];
                                case 7:
                                    // Wait before retrying
                                    _b.sent();
                                    return [3 /*break*/, 8];
                                case 8: return [2 /*return*/];
                            }
                        });
                    };
                    attempt = 1;
                    _a.label = 1;
                case 1:
                    if (!(attempt <= retries)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(attempt)];
                case 2:
                    state_1 = _a.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _a.label = 3;
                case 3:
                    attempt++;
                    return [3 /*break*/, 1];
                case 4: 
                // This should never be reached, but TypeScript requires it
                throw new Error('Unexpected error in MongoDB connection');
            }
        });
    });
}
/**
 * Closes the MongoDB connection
 */
function closeDatabaseConnection() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!cachedClient) return [3 /*break*/, 2];
                    return [4 /*yield*/, cachedClient.close()];
                case 1:
                    _a.sent();
                    cachedClient = null;
                    cachedDb = null;
                    log('MongoDB connection closed');
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
/**
 * Gets the current database instance
 */
function getDatabase() {
    if (!cachedDb) {
        throw new Error('Database not connected. Call connectToDatabase first.');
    }
    return cachedDb;
}

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
var connection_1 = require("@/lib/db/connection");
// Load environment variables
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
// Demo data for 8 metro cities with accurate coordinates
var metroCities = [
    {
        name: "Delhi",
        stations: [
            {
                name: "Delhi Metro Station",
                address: "Rajiv Chowk, New Delhi",
                lat: 28.6328,
                lng: 77.2194,
                slots: [
                    { slotId: "delhi-1-1", status: "available", chargerType: "AC Type 2", pricePerHour: 50 },
                    { slotId: "delhi-1-2", status: "available", chargerType: "DC CHAdeMO", pricePerHour: 60 },
                    { slotId: "delhi-1-3", status: "occupied", chargerType: "DC CCS", pricePerHour: 70 },
                    { slotId: "delhi-1-4", status: "available", chargerType: "AC Type 1", pricePerHour: 45 },
                ]
            },
            {
                name: "Connaught Place Hub",
                address: "Connaught Place, New Delhi",
                lat: 28.6333,
                lng: 77.2167,
                slots: [
                    { slotId: "delhi-2-1", status: "available", chargerType: "AC Type 2", pricePerHour: 50 },
                    { slotId: "delhi-2-2", status: "maintenance", chargerType: "DC CHAdeMO", pricePerHour: 60 },
                    { slotId: "delhi-2-3", status: "available", chargerType: "DC CCS", pricePerHour: 70 },
                ]
            },
            {
                name: "South Delhi Complex",
                address: "Hauz Khas, New Delhi",
                lat: 28.5542,
                lng: 77.1898,
                slots: [
                    { slotId: "delhi-3-1", status: "available", chargerType: "AC Type 1", pricePerHour: 45 },
                    { slotId: "delhi-3-2", status: "available", chargerType: "AC Type 2", pricePerHour: 50 },
                    { slotId: "delhi-3-3", status: "occupied", chargerType: "DC CCS", pricePerHour: 70 },
                    { slotId: "delhi-3-4", status: "available", chargerType: "DC CHAdeMO", pricePerHour: 60 },
                ]
            },
            {
                name: "East Delhi Mall",
                address: "Welcome Metro Station, East Delhi",
                lat: 28.6726,
                lng: 77.2818,
                slots: [
                    { slotId: "delhi-4-1", status: "available", chargerType: "AC Type 2", pricePerHour: 50 },
                    { slotId: "delhi-4-2", status: "available", chargerType: "DC CCS", pricePerHour: 70 },
                ]
            },
            {
                name: "North Delhi Center",
                address: "Kashmere Gate, North Delhi",
                lat: 28.6675,
                lng: 77.2254,
                slots: [
                    { slotId: "delhi-5-1", status: "available", chargerType: "AC Type 1", pricePerHour: 45 },
                    { slotId: "delhi-5-2", status: "occupied", chargerType: "DC CHAdeMO", pricePerHour: 60 },
                    { slotId: "delhi-5-3", status: "available", chargerType: "DC CCS", pricePerHour: 70 },
                    { slotId: "delhi-5-4", status: "available", chargerType: "AC Type 2", pricePerHour: 50 },
                ]
            }
        ]
    },
    {
        name: "Mumbai",
        stations: [
            {
                name: "Mumbai Central Station",
                address: "Mumbai Central, Mumbai",
                lat: 18.9693,
                lng: 72.8202,
                slots: [
                    { slotId: "mumbai-1-1", status: "available", chargerType: "AC Type 2", pricePerHour: 55 },
                    { slotId: "mumbai-1-2", status: "available", chargerType: "DC CCS", pricePerHour: 75 },
                    { slotId: "mumbai-1-3", status: "occupied", chargerType: "DC CHAdeMO", pricePerHour: 65 },
                ]
            },
            {
                name: "Bandra Kurla Complex",
                address: "BKC, Mumbai",
                lat: 19.0676,
                lng: 72.8642,
                slots: [
                    { slotId: "mumbai-2-1", status: "available", chargerType: "AC Type 1", pricePerHour: 50 },
                    { slotId: "mumbai-2-2", status: "available", chargerType: "AC Type 2", pricePerHour: 55 },
                    { slotId: "mumbai-2-3", status: "maintenance", chargerType: "DC CCS", pricePerHour: 75 },
                ]
            },
            {
                name: "Powai Hub",
                address: "IIT Bombay, Powai, Mumbai",
                lat: 19.1310,
                lng: 72.9136,
                slots: [
                    { slotId: "mumbai-3-1", status: "available", chargerType: "AC Type 2", pricePerHour: 55 },
                    { slotId: "mumbai-3-2", status: "available", chargerType: "DC CHAdeMO", pricePerHour: 65 },
                    { slotId: "mumbai-3-3", status: "available", chargerType: "DC CCS", pricePerHour: 75 },
                ]
            },
            {
                name: "Marine Lines Station",
                address: "Marine Lines, Mumbai",
                lat: 18.9436,
                lng: 72.8202,
                slots: [
                    { slotId: "mumbai-4-1", status: "available", chargerType: "AC Type 1", pricePerHour: 50 },
                    { slotId: "mumbai-4-2", status: "occupied", chargerType: "AC Type 2", pricePerHour: 55 },
                ]
            },
            {
                name: "Andheri West Point",
                address: "Andheri West, Mumbai",
                lat: 19.1200,
                lng: 72.8480,
                slots: [
                    { slotId: "mumbai-5-1", status: "available", chargerType: "AC Type 2", pricePerHour: 55 },
                    { slotId: "mumbai-5-2", status: "available", chargerType: "DC CCS", pricePerHour: 75 },
                    { slotId: "mumbai-5-3", status: "available", chargerType: "DC CHAdeMO", pricePerHour: 65 },
                ]
            }
        ]
    },
    {
        name: "Kolkata",
        stations: [
            {
                name: "Kolkata Metro Station",
                address: "Park Street, Kolkata",
                lat: 22.5546,
                lng: 88.3508,
                slots: [
                    { slotId: "kolkata-1-1", status: "available", chargerType: "AC Type 2", pricePerHour: 48 },
                    { slotId: "kolkata-1-2", status: "available", chargerType: "DC CCS", pricePerHour: 68 },
                ]
            },
            {
                name: "Salt Lake Hub",
                address: "Salt Lake City, Kolkata",
                lat: 22.5800,
                lng: 88.4100,
                slots: [
                    { slotId: "kolkata-2-1", status: "available", chargerType: "AC Type 1", pricePerHour: 43 },
                    { slotId: "kolkata-2-2", status: "occupied", chargerType: "AC Type 2", pricePerHour: 48 },
                    { slotId: "kolkata-2-3", status: "available", chargerType: "DC CHAdeMO", pricePerHour: 58 },
                ]
            },
            {
                name: "Howrah Station",
                address: "Howrah, Kolkata",
                lat: 22.5850,
                lng: 88.3080,
                slots: [
                    { slotId: "kolkata-3-1", status: "available", chargerType: "AC Type 2", pricePerHour: 48 },
                    { slotId: "kolkata-3-2", status: "available", chargerType: "DC CCS", pricePerHour: 68 },
                ]
            },
            {
                name: "Gariahat Market",
                address: "Gariahat, Kolkata",
                lat: 22.5200,
                lng: 88.3600,
                slots: [
                    { slotId: "kolkata-4-1", status: "available", chargerType: "AC Type 1", pricePerHour: 43 },
                    { slotId: "kolkata-4-2", status: "maintenance", chargerType: "AC Type 2", pricePerHour: 48 },
                ]
            },
            {
                name: "Dum Dum Point",
                address: "Dum Dum, Kolkata",
                lat: 22.5800,
                lng: 88.3600,
                slots: [
                    { slotId: "kolkata-5-1", status: "available", chargerType: "AC Type 2", pricePerHour: 48 },
                    { slotId: "kolkata-5-2", status: "available", chargerType: "DC CHAdeMO", pricePerHour: 58 },
                ]
            }
        ]
    },
    {
        name: "Chennai",
        stations: [
            {
                name: "Chennai Central",
                address: "Chennai Central, Chennai",
                lat: 13.0833,
                lng: 80.2833,
                slots: [
                    { slotId: "chennai-1-1", status: "available", chargerType: "AC Type 2", pricePerHour: 52 },
                    { slotId: "chennai-1-2", status: "occupied", chargerType: "DC CCS", pricePerHour: 72 },
                ]
            },
            {
                name: "T Nagar Hub",
                address: "T Nagar, Chennai",
                lat: 13.0333,
                lng: 80.2333,
                slots: [
                    { slotId: "chennai-2-1", status: "available", chargerType: "AC Type 1", pricePerHour: 47 },
                    { slotId: "chennai-2-2", status: "available", chargerType: "AC Type 2", pricePerHour: 52 },
                ]
            },
            {
                name: "Anna University",
                address: "Guindy, Chennai",
                lat: 13.0100,
                lng: 80.2300,
                slots: [
                    { slotId: "chennai-3-1", status: "available", chargerType: "AC Type 2", pricePerHour: 52 },
                    { slotId: "chennai-3-2", status: "available", chargerType: "DC CHAdeMO", pricePerHour: 62 },
                ]
            },
            {
                name: "Egmore Station",
                address: "Egmore, Chennai",
                lat: 13.0700,
                lng: 80.2500,
                slots: [
                    { slotId: "chennai-4-1", status: "available", chargerType: "AC Type 1", pricePerHour: 47 },
                    { slotId: "chennai-4-2", status: "maintenance", chargerType: "AC Type 2", pricePerHour: 52 },
                ]
            },
            {
                name: "Velachery Point",
                address: "Velachery, Chennai",
                lat: 12.9800,
                lng: 80.2200,
                slots: [
                    { slotId: "chennai-5-1", status: "available", chargerType: "AC Type 2", pricePerHour: 52 },
                    { slotId: "chennai-5-2", status: "available", chargerType: "DC CCS", pricePerHour: 72 },
                ]
            }
        ]
    },
    {
        name: "Bengaluru",
        stations: [
            {
                name: "Bangalore Metro",
                address: "MG Road, Bengaluru",
                lat: 12.9750,
                lng: 77.5950,
                slots: [
                    { slotId: "bengaluru-1-1", status: "available", chargerType: "AC Type 2", pricePerHour: 53 },
                    { slotId: "bengaluru-1-2", status: "available", chargerType: "DC CCS", pricePerHour: 73 },
                ]
            },
            {
                name: "Koramangala Hub",
                address: "Koramangala, Bengaluru",
                lat: 12.9350,
                lng: 77.6250,
                slots: [
                    { slotId: "bengaluru-2-1", status: "available", chargerType: "AC Type 1", pricePerHour: 48 },
                    { slotId: "bengaluru-2-2", status: "occupied", chargerType: "AC Type 2", pricePerHour: 53 },
                ]
            },
            {
                name: "Whitefield Complex",
                address: "Whitefield, Bengaluru",
                lat: 12.9700,
                lng: 77.7100,
                slots: [
                    { slotId: "bengaluru-3-1", status: "available", chargerType: "AC Type 2", pricePerHour: 53 },
                    { slotId: "bengaluru-3-2", status: "available", chargerType: "DC CHAdeMO", pricePerHour: 63 },
                ]
            },
            {
                name: "Indiranagar Station",
                address: "Indiranagar, Bengaluru",
                lat: 12.9750,
                lng: 77.6400,
                slots: [
                    { slotId: "bengaluru-4-1", status: "available", chargerType: "AC Type 1", pricePerHour: 48 },
                    { slotId: "bengaluru-4-2", status: "available", chargerType: "AC Type 2", pricePerHour: 53 },
                ]
            },
            {
                name: "Electronic City",
                address: "Electronic City, Bengaluru",
                lat: 12.8400,
                lng: 77.6500,
                slots: [
                    { slotId: "bengaluru-5-1", status: "available", chargerType: "AC Type 2", pricePerHour: 53 },
                    { slotId: "bengaluru-5-2", status: "maintenance", chargerType: "DC CCS", pricePerHour: 73 },
                ]
            }
        ]
    },
    {
        name: "Hyderabad",
        stations: [
            {
                name: "Hyderabad Metro Rail",
                address: "Hitech City, Hyderabad",
                lat: 17.4500,
                lng: 78.3800,
                slots: [
                    { slotId: "hyderabad-1-1", status: "available", chargerType: "AC Type 2", pricePerHour: 51 },
                    { slotId: "hyderabad-1-2", status: "available", chargerType: "DC CCS", pricePerHour: 71 },
                ]
            },
            {
                name: "Banjara Hills Hub",
                address: "Banjara Hills, Hyderabad",
                lat: 17.4100,
                lng: 78.4300,
                slots: [
                    { slotId: "hyderabad-2-1", status: "available", chargerType: "AC Type 1", pricePerHour: 46 },
                    { slotId: "hyderabad-2-2", status: "occupied", chargerType: "AC Type 2", pricePerHour: 51 },
                ]
            },
            {
                name: "Gachibowli Complex",
                address: "Gachibowli, Hyderabad",
                lat: 17.4400,
                lng: 78.3500,
                slots: [
                    { slotId: "hyderabad-3-1", status: "available", chargerType: "AC Type 2", pricePerHour: 51 },
                    { slotId: "hyderabad-3-2", status: "available", chargerType: "DC CHAdeMO", pricePerHour: 61 },
                ]
            },
            {
                name: "Secunderabad Station",
                address: "Secunderabad, Hyderabad",
                lat: 17.4300,
                lng: 78.5000,
                slots: [
                    { slotId: "hyderabad-4-1", status: "available", chargerType: "AC Type 1", pricePerHour: 46 },
                    { slotId: "hyderabad-4-2", status: "available", chargerType: "AC Type 2", pricePerHour: 51 },
                ]
            },
            {
                name: "Kondapur Point",
                address: "Kondapur, Hyderabad",
                lat: 17.4700,
                lng: 78.3800,
                slots: [
                    { slotId: "hyderabad-5-1", status: "available", chargerType: "AC Type 2", pricePerHour: 51 },
                    { slotId: "hyderabad-5-2", status: "available", chargerType: "DC CCS", pricePerHour: 71 },
                ]
            }
        ]
    },
    {
        name: "Ahmedabad",
        stations: [
            {
                name: "Ahmedabad Metro",
                address: "Ashram Road, Ahmedabad",
                lat: 23.0200,
                lng: 72.5800,
                slots: [
                    { slotId: "ahmedabad-1-1", status: "available", chargerType: "AC Type 2", pricePerHour: 49 },
                    { slotId: "ahmedabad-1-2", status: "maintenance", chargerType: "DC CCS", pricePerHour: 69 },
                ]
            },
            {
                name: "CG Road Hub",
                address: "CG Road, Ahmedabad",
                lat: 23.0300,
                lng: 72.5600,
                slots: [
                    { slotId: "ahmedabad-2-1", status: "available", chargerType: "AC Type 1", pricePerHour: 44 },
                    { slotId: "ahmedabad-2-2", status: "available", chargerType: "AC Type 2", pricePerHour: 49 },
                ]
            },
            {
                name: "Vastrapur Complex",
                address: "Vastrapur, Ahmedabad",
                lat: 23.0500,
                lng: 72.5300,
                slots: [
                    { slotId: "ahmedabad-3-1", status: "available", chargerType: "AC Type 2", pricePerHour: 49 },
                    { slotId: "ahmedabad-3-2", status: "occupied", chargerType: "DC CHAdeMO", pricePerHour: 59 },
                ]
            },
            {
                name: "Navrangpura Station",
                address: "Navrangpura, Ahmedabad",
                lat: 23.0300,
                lng: 72.5800,
                slots: [
                    { slotId: "ahmedabad-4-1", status: "available", chargerType: "AC Type 1", pricePerHour: 44 },
                    { slotId: "ahmedabad-4-2", status: "available", chargerType: "AC Type 2", pricePerHour: 49 },
                ]
            },
            {
                name: "Sarkhej Point",
                address: "Sarkhej, Ahmedabad",
                lat: 22.9900,
                lng: 72.5300,
                slots: [
                    { slotId: "ahmedabad-5-1", status: "available", chargerType: "AC Type 2", pricePerHour: 49 },
                    { slotId: "ahmedabad-5-2", status: "available", chargerType: "DC CCS", pricePerHour: 69 },
                ]
            }
        ]
    },
    {
        name: "Pune",
        stations: [
            {
                name: "Pune Railway Station",
                address: "Pune Railway Station, Pune",
                lat: 18.5300,
                lng: 73.8700,
                slots: [
                    { slotId: "pune-1-1", status: "available", chargerType: "AC Type 2", pricePerHour: 54 },
                    { slotId: "pune-1-2", status: "available", chargerType: "DC CCS", pricePerHour: 74 },
                ]
            },
            {
                name: "Koregaon Park Hub",
                address: "Koregaon Park, Pune",
                lat: 18.5400,
                lng: 73.8900,
                slots: [
                    { slotId: "pune-2-1", status: "available", chargerType: "AC Type 1", pricePerHour: 49 },
                    { slotId: "pune-2-2", status: "occupied", chargerType: "AC Type 2", pricePerHour: 54 },
                ]
            },
            {
                name: "Hinjewadi Complex",
                address: "Hinjewadi, Pune",
                lat: 18.5900,
                lng: 73.7400,
                slots: [
                    { slotId: "pune-3-1", status: "available", chargerType: "AC Type 2", pricePerHour: 54 },
                    { slotId: "pune-3-2", status: "available", chargerType: "DC CHAdeMO", pricePerHour: 64 },
                ]
            },
            {
                name: "Baner Station",
                address: "Baner, Pune",
                lat: 18.5600,
                lng: 73.7700,
                slots: [
                    { slotId: "pune-4-1", status: "available", chargerType: "AC Type 1", pricePerHour: 49 },
                    { slotId: "pune-4-2", status: "maintenance", chargerType: "AC Type 2", pricePerHour: 54 },
                ]
            },
            {
                name: "Hadapsar Point",
                address: "Hadapsar, Pune",
                lat: 18.5100,
                lng: 73.9300,
                slots: [
                    { slotId: "pune-5-1", status: "available", chargerType: "AC Type 2", pricePerHour: 54 },
                    { slotId: "pune-5-2", status: "available", chargerType: "DC CCS", pricePerHour: 74 },
                ]
            }
        ]
    }
];
function seedDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var db, typedDb, _i, metroCities_1, city, _a, _b, station, stationData, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 11, , 12]);
                    return [4 /*yield*/, (0, connection_1.connectToDatabase)()];
                case 1:
                    db = (_c.sent()).db;
                    typedDb = db;
                    // Clear existing data
                    return [4 /*yield*/, db.collection("stations").deleteMany({})];
                case 2:
                    // Clear existing data
                    _c.sent();
                    return [4 /*yield*/, db.collection("bookings").deleteMany({})];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, db.collection("payments").deleteMany({})];
                case 4:
                    _c.sent();
                    _i = 0, metroCities_1 = metroCities;
                    _c.label = 5;
                case 5:
                    if (!(_i < metroCities_1.length)) return [3 /*break*/, 10];
                    city = metroCities_1[_i];
                    _a = 0, _b = city.stations;
                    _c.label = 6;
                case 6:
                    if (!(_a < _b.length)) return [3 /*break*/, 9];
                    station = _b[_a];
                    stationData = {
                        city: city.name,
                        name: station.name,
                        address: station.address,
                        lat: station.lat,
                        lng: station.lng,
                        slots: station.slots
                    };
                    return [4 /*yield*/, typedDb.collection("stations").insertOne(stationData)];
                case 7:
                    _c.sent();
                    _c.label = 8;
                case 8:
                    _a++;
                    return [3 /*break*/, 6];
                case 9:
                    _i++;
                    return [3 /*break*/, 5];
                case 10:
                    console.log("Database seeded successfully with demo data for 8 metro cities!");
                    return [3 /*break*/, 12];
                case 11:
                    error_1 = _c.sent();
                    console.error("Error seeding database:", error_1);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
// Run the seed function
seedDatabase();

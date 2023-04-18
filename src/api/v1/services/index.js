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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const ApiError_1 = require("../../utils/ApiError");
//Method to filter data based on the keys
const filterSearchCenters = (clinics, search, keys) => {
    var lowSearch = search.toLowerCase();
    return clinics.filter((clinic) => keys.some((key) => String(clinic[key]).toLowerCase().includes(lowSearch)));
};
//API Service method to search medical centers available in array of JSON URL's
const searchMedicalCenters = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clinicUrls = [
            "https://storage.googleapis.com/scratchpay-code-challenge/dental-clinics.json",
            "https://storage.googleapis.com/scratchpay-code-challenge/vet-clinics.json",
        ];
        let clinicDetails = yield Promise.all(clinicUrls.map((url) => (0, node_fetch_1.default)(url).then((e) => e.json())));
        const finalResult = clinicDetails.flat();
        let searchedCenters = finalResult;
        if (data.name) {
            searchedCenters = filterSearchCenters(searchedCenters, data.name, [
                "stateName",
                "clinicName",
                "stateCode",
                "name",
            ]);
        }
        if (data.from || data.to)
            if ((data.from &&
                (0, moment_1.default)(data.from, "HH:mm").format("HH:mm") !== data.from) ||
                (data.to && (0, moment_1.default)(data.to, "HH:mm").format("HH:mm") !== data.to)) {
                return {
                    data: {
                        message: "Date format must be HH:mm",
                    },
                    statusCode: 500,
                    success: false,
                };
            }
        //Maximum Availability for the clinics
        let minFrom = "00:00";
        let maxTo = "24:00";
        if (data.from)
            minFrom = data.from;
        if (data.to)
            maxTo = data.To;
        if (data.from) {
            let momentFrom = (0, moment_1.default)(data.from, "HH:mm");
            searchedCenters = searchedCenters.filter((x) => {
                if (x.availability)
                    return (0, moment_1.default)(x.availability.from, "HH:mm").isSameOrAfter(momentFrom);
                else
                    return (0, moment_1.default)(x.opening.from, "HH:mm").isSameOrAfter(momentFrom);
            });
        }
        if (data.to) {
            let momentTo = (0, moment_1.default)(data.to, "HH:mm");
            searchedCenters = searchedCenters.filter((x) => {
                if (x.availability)
                    (0, moment_1.default)(x.availability.to, "HH:mm").isSameOrBefore(momentTo);
                else
                    return (0, moment_1.default)(x.opening.to, "HH:mm").isSameOrAfter(momentTo);
            });
        }
        return {
            statusCode: 200,
            success: true,
            data: searchedCenters,
        };
    }
    catch (err) {
        return {
            statusCode: 500,
            success: false,
            data: { message: "Internal Server Error" },
        };
    }
});
const searchClinics = (name, state, from, to) => __awaiter(void 0, void 0, void 0, function* () {
    const clinicUrls = [
        "https://storage.googleapis.com/scratchpay-code-challenge/dental-clinics.json",
        "https://storage.googleapis.com/scratchpay-code-challenge/vet-clinics.json",
    ];
    let clinicDetails = yield Promise.all(clinicUrls.map((url) => (0, node_fetch_1.default)(url).then((e) => e.json())));
    const finalResult = clinicDetails.flat();
    let searchedCenters = finalResult;
    if (name) {
        searchedCenters = filterSearchCenters(searchedCenters, name, [
            "stateName",
            "clinicName",
            "stateCode",
            "name",
        ]);
    }
    if (from || to) {
        if ((from && (0, moment_1.default)(from, "HH:mm").format("HH:mm") !== from) ||
            (to && (0, moment_1.default)(to, "HH:mm").format("HH:mm") !== to)) {
            throw new ApiError_1.ApiError("Format Error", 422, "Date format must be HH:mm");
        }
    }
    //Maximum Availability for the clinics
    let minFrom = "00:00";
    let maxTo = "24:00";
    if (from)
        minFrom = from;
    if (to)
        maxTo = to;
    if (from) {
        let momentFrom = (0, moment_1.default)(minFrom, "HH:mm");
        searchedCenters = searchedCenters.filter((x) => {
            if (x.availability)
                return (0, moment_1.default)(x.availability.from, "HH:mm").isSameOrAfter(momentFrom);
            else
                return (0, moment_1.default)(x.opening.from, "HH:mm").isSameOrAfter(momentFrom);
        });
    }
    if (to) {
        let momentTo = (0, moment_1.default)(maxTo, "HH:mm");
        searchedCenters = searchedCenters.filter((x) => {
            if (x.availability)
                (0, moment_1.default)(x.availability.to, "HH:mm").isSameOrBefore(momentTo);
            else
                return (0, moment_1.default)(x.opening.to, "HH:mm").isSameOrAfter(momentTo);
        });
    }
    let finalSearchedClinics;
    finalSearchedClinics = searchedCenters.map((sc) => {
        let clinic = {
            name: "",
            availability: {
                from: "",
                to: "",
            },
            state: "",
        };
        if (sc.stateCode)
            clinic.state = sc.stateCode;
        if (sc.stateName)
            clinic.state = sc.stateName;
        if (sc.availability) {
            clinic.availability.from = sc.availability.from;
            clinic.availability.to = sc.availability.to;
        }
        if (sc.opening) {
            clinic.availability.from = sc.opening.from;
            clinic.availability.to = sc.opening.to;
        }
        if (sc.name)
            clinic.name = sc.name;
        if (sc.clinicName)
            clinic.name = sc.clinicName;
        return clinic;
    });
    return finalSearchedClinics;
});
exports.default = {
    searchMedicalCenters,
    searchClinics,
};

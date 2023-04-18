import moment from "moment";
import fetch from "node-fetch";
import { Clinic } from "../../interface/clinic.interface";
import { ApiError } from "../../utils/ApiError";

//Method to filter data based on the keys
const filterSearchCenters = (
  clinics: any[],
  search: string,
  keys: string[]
) => {
  var lowSearch = search.toLowerCase();
  return clinics.filter((clinic) =>
    keys.some((key: any) =>
      String(clinic[key]).toLowerCase().includes(lowSearch)
    )
  );
};

//API Service method to search medical centers available in array of JSON URL's
const searchMedicalCenters = async (data: any) => {
  try {
    const clinicUrls = [
      "https://storage.googleapis.com/scratchpay-code-challenge/dental-clinics.json",
      "https://storage.googleapis.com/scratchpay-code-challenge/vet-clinics.json",
    ];
    let clinicDetails = await Promise.all(
      clinicUrls.map((url) => fetch(url).then((e) => e.json()))
    );
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
      if (
        (data.from &&
          moment(data.from, "HH:mm").format("HH:mm") !== data.from) ||
        (data.to && moment(data.to, "HH:mm").format("HH:mm") !== data.to)
      ) {
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

    if (data.from) minFrom = data.from;
    if (data.to) maxTo = data.To;

    if (data.from) {
      let momentFrom = moment(data.from, "HH:mm");
      searchedCenters = searchedCenters.filter((x) => {
        if (x.availability)
          return moment(x.availability.from, "HH:mm").isSameOrAfter(momentFrom);
        else return moment(x.opening.from, "HH:mm").isSameOrAfter(momentFrom);
      });
    }
    if (data.to) {
      let momentTo = moment(data.to, "HH:mm");
      searchedCenters = searchedCenters.filter((x) => {
        if (x.availability)
          moment(x.availability.to, "HH:mm").isSameOrBefore(momentTo);
        else return moment(x.opening.to, "HH:mm").isSameOrAfter(momentTo);
      });
    }
    return {
      statusCode: 200,
      success: true,
      data: searchedCenters,
    };
  } catch (err) {
    return {
      statusCode: 500,
      success: false,
      data: { message: "Internal Server Error" },
    };
  }
};

const searchClinics = async (
  name: string,
  state: string,
  from: string,
  to: string
): Promise<Clinic[]> => {
  const clinicUrls = [
    "https://storage.googleapis.com/scratchpay-code-challenge/dental-clinics.json",
    "https://storage.googleapis.com/scratchpay-code-challenge/vet-clinics.json",
  ];
  let clinicDetails = await Promise.all(
    clinicUrls.map((url) => fetch(url).then((e) => e.json()))
  );
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
    if (
      (from && moment(from, "HH:mm").format("HH:mm") !== from) ||
      (to && moment(to, "HH:mm").format("HH:mm") !== to)
    ) {
      throw new ApiError("Format Error", 422, "Date format must be HH:mm");
    }
  }
  //Maximum Availability for the clinics
  let minFrom = "00:00";
  let maxTo = "24:00";

  if (from) minFrom = from;
  if (to) maxTo = to;

  if (from) {
    let momentFrom = moment(minFrom, "HH:mm");
    searchedCenters = searchedCenters.filter((x) => {
      if (x.availability)
        return moment(x.availability.from, "HH:mm").isSameOrAfter(momentFrom);
      else return moment(x.opening.from, "HH:mm").isSameOrAfter(momentFrom);
    });
  }
  if (to) {
    let momentTo = moment(maxTo, "HH:mm");
    searchedCenters = searchedCenters.filter((x) => {
      if (x.availability)
        moment(x.availability.to, "HH:mm").isSameOrBefore(momentTo);
      else return moment(x.opening.to, "HH:mm").isSameOrAfter(momentTo);
    });
  }
  let finalSearchedClinics: Clinic[];
  finalSearchedClinics = searchedCenters.map((sc) => {
    let clinic: Clinic = {
      name: "",
      availability: {
        from: "",
        to: "",
      },
      state: "",
    };
    if (sc.stateCode) clinic.state = sc.stateCode;
    if (sc.stateName) clinic.state = sc.stateName;
    if (sc.availability) {
      clinic.availability.from = sc.availability.from;
      clinic.availability.to = sc.availability.to;
    }
    if (sc.opening) {
      clinic.availability.from = sc.opening.from;
      clinic.availability.to = sc.opening.to;
    }
    if (sc.name) clinic.name = sc.name;
    if (sc.clinicName) clinic.name = sc.clinicName;

    return clinic;
  });
  return finalSearchedClinics;
};

export default {
  searchMedicalCenters,
  searchClinics,
};

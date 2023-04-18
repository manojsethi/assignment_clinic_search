import { Controller, Get, Query, Response, Route, SuccessResponse } from "tsoa";
import { Clinic } from "../../../interface/clinic.interface";
import { ApiError } from "../../../utils/ApiError";
import services from "../../services";

@Route("clinic")
export class ClinicController extends Controller {
  @SuccessResponse("200", "OK")
  @Response<ApiError>("500", "Internal Server Error", {
    name: "Internal Server Error",
    statusCode: 500,
    message: "Error Message",
  })
  @Get("search")
  public async searchClinics(
    @Query() name?: string,
    @Query() state?: string,
    @Query() from?: string,
    @Query() to?: string
  ): Promise<Clinic[]> {
    try {
      let result = await services.searchClinics(
        name ?? "",
        state ?? "",
        from ?? "",
        to ?? ""
      );
      return result;
    } catch (err) {
      let error = "";
      if (typeof err === "string") {
        err.toUpperCase();
      } else if (err instanceof Error) {
        err.message;
      }
      throw new ApiError("Internal Server Error", 500, error);
    }
  }
}

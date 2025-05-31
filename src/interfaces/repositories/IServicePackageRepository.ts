import { IServicePackage } from "../../models/servicePackage.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IServicePackageRepository extends IBaseRepository<IServicePackage> {
    findServicePackagesWithPopulate(): Promise<IServicePackage[]>;
}

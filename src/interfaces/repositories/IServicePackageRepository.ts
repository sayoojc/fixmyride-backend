import { IServicePackage } from "../../models/servicePackage.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IServicePackageRepository extends IBaseRepository<IServicePackage> {
    findServicePackagesWithPopulate( query: any, skip: number, limit: number): Promise<IServicePackage[]>;
    countDocuments(query: any): Promise<number>
    findServicePackageByIdWithPopulate(id: string): Promise<IServicePackage | null>
}


export const FUEL_TYPES = ["petrol","diesel","lpg","cng"];

const validateFuelTypes = (fuelTypes:string[]) => {
    fuelTypes.forEach((type) => {
        if(!FUEL_TYPES.includes(type)){
            return false;
        }
    })
    return true;
}

export default validateFuelTypes

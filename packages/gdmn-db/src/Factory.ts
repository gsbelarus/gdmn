import {ADriver} from "./ADriver";
import {Driver} from "./fb/Driver";

export type DriverNames = "firebird";

export abstract class Factory {

    /** Firebird driver */
    static get FBDriver(): ADriver {
        return new Driver();
    }

    static getDriver(driver: DriverNames): ADriver {
        switch (driver) {
            case "firebird": {
                return Factory.FBDriver;
            }
            default:
                throw new Error("Unknown driver name");
        }
    }
}

import { Factory } from 'pip-services3-components-node';
import { Descriptor } from 'pip-services3-commons-node';
export declare class FacadeFactory extends Factory {
    static Descriptor: Descriptor;
    static MainFacadeServiceDescriptor: Descriptor;
    static PartitionFacadeServiceDescriptor: Descriptor;
    static AuthManagerDescriptor: Descriptor;
    static SessionManagerDescriptor: Descriptor;
    static AboutOperationsDescriptor: Descriptor;
    constructor();
}

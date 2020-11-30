/** @module build */ 
import { Factory } from 'pip-services3-components-node';
import { Descriptor } from 'pip-services3-commons-node';

import { MainFacadeService } from '../services/MainFacadeService';
import { PartitionFacadeService } from '../services/PartitionFacadeService';
import { AboutOperations } from '../operations/AboutOperations';

export class FacadeFactory extends Factory {
	public static Descriptor = new Descriptor("pip-services", "factory", "facade", "default", "1.0");
	public static MainFacadeServiceDescriptor = new Descriptor("pip-services", "facade-service", "default", "*", "1.0");
	public static PartitionFacadeServiceDescriptor = new Descriptor("pip-services", "facade-partition", "default", "*", "1.0");
	public static AuthManagerDescriptor = new Descriptor("pip-service", "facade-authorization", "default", "*", "1.0");
	public static SessionManagerDescriptor = new Descriptor("pip-services", "facade-session", "default", "*", "1.0");
	public static AboutOperationsDescriptor = new Descriptor("pip-services", "facade-operations", "about", "*", "1.0");
	
	public constructor() {
		super();
		this.registerAsType(FacadeFactory.MainFacadeServiceDescriptor, MainFacadeService);
		this.registerAsType(FacadeFactory.PartitionFacadeServiceDescriptor, PartitionFacadeService);
		this.registerAsType(FacadeFactory.AboutOperationsDescriptor, AboutOperations);
	}
	
}

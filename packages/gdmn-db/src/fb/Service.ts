import {Service as NativeService, Status, Util, XpbBuilder} from "node-firebird-native-api";
import {setTimeout} from "timers";
import {AService, IRestoreOptions, IServiceOptions} from "../AService";
import {Client} from "./Client";
import {
    isc_action_svc,
    isc_info,
    isc_info_svc,
    isc_spb,
    isc_spb_bkp,
    isc_spb_res,
    XpbBuilderParams
} from "./utils/constants";
import {iscVaxInteger2} from "./utils/fb-utils";

function createServiceAttachmentBuffer(svcOptions: IServiceOptions, util: Util, status: Status): XpbBuilder {
    const svcAttachB = (util.getXpbBuilderSync(status, XpbBuilderParams.SPB_ATTACH, undefined, 0))!;
    svcAttachB.insertStringSync(status, isc_spb.user_name, svcOptions.username || "sysdba");
    svcAttachB.insertStringSync(status, isc_spb.password, svcOptions.password || "masterkey");
    return svcAttachB;
}

function createServiceRequestBuffer(status: Status, util: Util): XpbBuilder {
    return (util.getXpbBuilderSync(status, XpbBuilderParams.SPB_START, undefined, 0))!;
}

export class Service implements AService {

    public static readonly BUFFER_SIZE = 1024;

    public readonly client = new Client();

    public svc?: NativeService;

    public async attach(options: IServiceOptions): Promise<void> {
        if (this.svc) {
            throw new Error("Service already attached");
        }

        await this.client.create();

        const util = this.client.client!.util;

        const attachObject = "service_mgr";
        const attachUrl = `${options.host}/${options.port}:${attachObject}`;

        this.svc = await this.client.statusAction(async (status) => {
            const attachSpb = createServiceAttachmentBuffer(options, util, status);
            return await this.client.client!.dispatcher!.attachServiceManagerAsync(
                status,
                attachUrl,
                attachSpb.getBufferLengthSync(status),
                attachSpb.getBufferSync(status)
            );
        });
    }

    public async detach(): Promise<void> {
        if (!this.svc) {
            throw new Error("Service already detached");
        }

        await this.client.statusAction(async (status) => {
            await this.svc!.detachAsync(status);
        });
        await this.client.destroy();
    }

    public async backupDatabase(dbPath: string, backupPath: string): Promise<void> {
        if (!this.svc) {
            throw new Error("Need attached Service");
        }
        const util = this.client.client!.util;
        await this.client.statusAction(async (status) => {
            const srb = createServiceRequestBuffer(status, util);
            srb.insertTagSync(status, isc_action_svc.backup);
            srb.insertStringSync(status, isc_spb.dbname, dbPath);
            srb.insertStringSync(status, isc_spb_bkp.file, backupPath);
            await this.executeServicesAction(srb);
        });
    }

    public async restoreDatabase(dbPath: string, backupPath: string, options?: IRestoreOptions): Promise<void> {
        if (!this.svc) {
            throw new Error("Need attached Service");
        }
        const util = this.client.client!.util;
        await this.client.statusAction(async (status) => {
            const srb = createServiceRequestBuffer(status, util);
            srb.insertTagSync(status, isc_action_svc.restore);
            srb.insertStringSync(status, isc_spb.dbname, dbPath);
            srb.insertStringSync(status, isc_spb_bkp.file, backupPath);

            if (options) {
                if (options.replace) {
                    srb.insertIntSync(status, isc_spb.options, isc_spb_res.replace);
                }
            }

            await this.executeServicesAction(srb);
        });
    }

    private async executeServicesAction(srb: XpbBuilder): Promise<void> {
        await this.client.statusAction(async (status) => {
            await this.svc!.startAsync(status, srb.getBufferLengthSync(status)!, srb.getBufferSync(status)!);
        });
        await this.pollService();
    }

    private async pollService(): Promise<void> {
        const util = this.client.client!.util;
        await this.client.statusAction(async (status) => {
            const infoSRB = createServiceRequestBuffer(status, util);
            infoSRB.insertTagSync(status, isc_info_svc.to_eof);

            let bufferSize = Service.BUFFER_SIZE;

            let processing = true;
            while (processing) {
                await new Promise((resolve) => setTimeout(resolve, 100));

                const buffer = await this.getServiceInfo(bufferSize, undefined, infoSRB);

                switch (buffer[0]) {
                    case isc_info_svc.to_eof:
                        const dataLength = iscVaxInteger2(buffer, 1);
                        if (dataLength === 0) {
                            if (buffer[3] !== isc_info.end) {
                                throw new Error("Unexpected end of stream reached.");
                            } else {
                                processing = false;
                                break;
                            }
                        }
                        break;

                    case isc_info.truncated:
                        bufferSize = bufferSize * 2;
                        break;
                    case isc_info.end:
                        processing = false;
                        break;

                }
            }
        });
    }

    private async getServiceInfo(
        maxBufferLength: number,
        spb?: XpbBuilder,
        srb?: XpbBuilder
    ): Promise<Buffer> {
        const responseBuffer = Buffer.alloc(maxBufferLength);

        await this.client.statusAction((status) => this.svc!.queryAsync(status,
            spb ? spb.getBufferLengthSync(status) : 0,
            spb && spb.getBufferSync(status),
            srb ? srb.getBufferLengthSync(status) : 0,
            srb && srb.getBufferSync(status),
            responseBuffer.byteLength,
            responseBuffer
        ));

        return responseBuffer;
    }
}

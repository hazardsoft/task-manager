import { ObjectId } from "mongodb";

const id: ObjectId = new ObjectId();
// uncomment if you want to see objectid details
// printId(id);

function printId(id: ObjectId): void {
    console.log(`objectid: ${id}`);
    console.log(`objectid length: ${id.inspect()}`);
    console.log(`objectid timestamp: ${id.getTimestamp().getTime()}`);

    type ObjectIdPartial = {
        name: string;
        start: number;
        end: number;
        hex?: string;
        dec?: number;
        bin?: string;
        paddedBin?: string;
    };

    const hex: string = id.toHexString();
    // bytes spec is taken from MongoDB official docs: https://www.mongodb.com/docs/manual/reference/method/ObjectId/
    const idParts: ObjectIdPartial[] = [
        { name: "timestamp", start: 0, end: 8 },
        { name: "random", start: 8, end: 18 },
        { name: "counter", start: 18, end: 24 },
    ];
    idParts.forEach((partial) => {
        partial.hex = hex.substring(partial.start, partial.end);
        partial.dec = parseInt(partial.hex, 16);
        partial.bin = partial.dec.toString(2);
        partial.paddedBin = partial.bin.padStart(partial.hex.length * 4, "0");

        console.log(
            `${partial.name}: hex ${partial.hex}, bin ${partial.bin}, padded bin ${partial.paddedBin}, dec ${partial.dec}`
        );
    });

    const idBufferView: Uint8Array = id.id;
    console.log(`buffer: ${idBufferView.join(",")}`);
    console.log(
        `buffer: length ${idBufferView.byteLength}, offset ${idBufferView.byteOffset}`
    );

    const timestampBufferView: Uint8Array = idBufferView.subarray(0, 4);
    console.log(`timestamp array: ${timestampBufferView.join(",")}`);

    const randomBufferView: Uint8Array = idBufferView.subarray(4, 9);
    console.log(`random array: ${randomBufferView.join(",")}`);

    const counterBufferView: Uint8Array = idBufferView.subarray(9);
    console.log(`counter array: ${counterBufferView.join(",")}`);

    const timestampDataView: DataView = new DataView(idBufferView.buffer, 0, 4);
    console.log(
        `read timestamp from objectid buffer: ${timestampDataView.getInt32(0)}`
    );
}

export { id };

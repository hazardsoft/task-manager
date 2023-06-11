import { ObjectId } from "mongodb";

const id: ObjectId = new ObjectId();
console.log(`objectid: ${id}`);
console.log(`objectid length: ${id.inspect()}`);
console.log(`objectid timestamp: ${id.getTimestamp().getTime()}`);

type ObjectIdPartial = {
    name: string;
    start: number;
    end: number;
    hex: string;
    bin: string;
    dec: number;
    paddedBin: string;
};

const hex: string = id.toHexString();
[
    <ObjectIdPartial>{ name: "timestamp", start: 0, end: 8 },
    <ObjectIdPartial>{ name: "random", start: 8, end: 18 },
    <ObjectIdPartial>{ name: "counter", start: 18, end: 24 },
].forEach((partial) => {
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

const randomDataView: DataView = new DataView(idBufferView.buffer, 4, 5);
console.log(`read random from objectid buffer: ${randomDataView}`);

const counterDataView: DataView = new DataView(idBufferView.buffer, 9, 3);
console.log(`read counter from objectid buffer: ${counterDataView.buffer}`);

export { id };

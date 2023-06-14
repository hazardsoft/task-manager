import typescript from "@rollup/plugin-typescript";

export default [
    {
        input: "src/index.ts",
        output: [
            {
                file: "dist/index.js",
                format: "es",
                sourcemap: true,
            },
        ],
        plugins: [typescript()],
        external: ["mongodb", "mongoose", "validator/lib/isEmail.js", "express", "cors"], // required to omit warning about non-bundled dependency
    },
];

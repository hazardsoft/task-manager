import typescript from "@rollup/plugin-typescript";

const isProduction = process.env.NODE_ENV === "production";

export default [
    {
        input: "src/index.ts",
        output: [
            {
                file: "dist/index.js",
                format: "es",
                sourcemap: !isProduction,
            },
        ],
        plugins: [typescript()],
        external: ["mongodb", "mongoose", "validator/lib/isEmail.js", "express", "bcrypt", "jsonwebtoken", "multer", "sharp", "@sendgrid/mail"], // required to omit warning about non-bundled dependency
    },
];

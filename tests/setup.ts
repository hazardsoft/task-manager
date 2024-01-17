import { vi } from "vitest";
import supertest from "supertest";
import { app } from "../src/app.js";
import {connect} from "../src/db.js";

const mocks = vi.hoisted(() => { 
    return {
        setApiKey: vi.fn(),
        sendEmail: vi.fn()
    }
})

vi.mock("@sendgrid/mail", () => {
    return {
        default: {
            setApiKey: mocks.setApiKey,
            send: mocks.sendEmail,
        }
    }
})

const request = supertest(app);
await connect();

export { request, mocks };
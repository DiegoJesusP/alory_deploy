import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

import { protectedEndpoint } from "../src/security/protected-endpoint";
import { UserController } from "../src/modules/users/user.controller";
import { UserService } from "../src/modules/users/user.service";

type MockResponse = {
  statusCode: number;
  body: unknown;
  status: (code: number) => MockResponse;
  json: (payload: unknown) => MockResponse;
};

const createMockResponse = (): MockResponse => ({
  statusCode: 200,
  body: null,
  status(code: number) {
    this.statusCode = code;
    return this;
  },
  json(payload: unknown) {
    this.body = payload;
    return this;
  },
});

const createAccessToken = (role: "ADMIN" | "EMPLOYEE") => {
  process.env.JWT_SECRET = "test-secret";

  return jwt.sign(
    {
      full_name: "Test User",
      role,
      type: "access",
    },
    process.env.JWT_SECRET,
    {
      subject: "test-user",
      expiresIn: 3600,
      jwtid: "test-jti",
    }
  );
};

test("protectedEndpoint should reject EMPLOYEE on ADMIN-only endpoint with 403", () => {
  const middleware = protectedEndpoint("ADMIN");
  const token = createAccessToken("EMPLOYEE");

  const req = {
    headers: {
      authorization: `Bearer ${token}`,
    },
  } as Request;
  const res = createMockResponse() as unknown as Response;

  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  middleware(req, res, next);

  assert.equal(nextCalled, false);
  assert.equal((res as unknown as MockResponse).statusCode, 403);
  assert.deepEqual((res as unknown as MockResponse).body, { message: "Acceso denegado" });
});

test("updateEmployee should return 404 when target employee does not exist", async () => {
  const original = UserService.updateEmployee;
  (UserService as unknown as { updateEmployee: typeof UserService.updateEmployee }).updateEmployee =
    async () => null;

  try {
    const req = {
      params: { id: "9999" },
      body: { full_name: "Nuevo Nombre" },
    } as unknown as Request;

    const res = createMockResponse() as unknown as Response;

    await UserController.updateEmployee(req, res);

    assert.equal((res as unknown as MockResponse).statusCode, 404);
  } finally {
    (UserService as unknown as { updateEmployee: typeof UserService.updateEmployee }).updateEmployee = original;
  }
});

test("deleteEmployee should return 404 when target employee does not exist", async () => {
  const original = UserService.deleteEmployee;
  (UserService as unknown as { deleteEmployee: typeof UserService.deleteEmployee }).deleteEmployee =
    async () => null;

  try {
    const req = {
      params: { id: "9999" },
    } as unknown as Request;

    const res = createMockResponse() as unknown as Response;

    await UserController.deleteEmployee(req, res);

    assert.equal((res as unknown as MockResponse).statusCode, 404);
  } finally {
    (UserService as unknown as { deleteEmployee: typeof UserService.deleteEmployee }).deleteEmployee = original;
  }
});

import { IHandlerFunction } from "~/types/wrapper-types";

export const config = {
  description: "Something profound",
  memorySize: 1024,
  events: [
    {
      http: {
        method: "post",
        path: "/sms/chat",
        cors: true,
        authorizer: "${self:custom.authorizer}",
      },
    },
  ],
};

/**
 * This is a test description along with parameter info detailed
 *
 * @param _request
 * @param _context
 */
export const fn: IHandlerFunction<void, void> = async (_request, _context) => {
  //
};

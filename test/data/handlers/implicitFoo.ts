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
 * @param _request this is the request param
 * @param _context
 *
 * @returns zippo; nothing happening
 */
export async function fn(_request: any, _context: any): Promise<void> {
  //
}

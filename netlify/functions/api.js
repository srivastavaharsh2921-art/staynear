const serverless = require("serverless-http");
const app = require("../../backend/src/server");

const handler = serverless(app);

exports.handler = (event, context) => {
    const normalizedPath = event.path.replace(
        /^\/\.netlify\/functions\/api\/?/,
        "/api/"
    );

    return handler(
        {
            ...event,
            path: normalizedPath
        },
        context
    );
};

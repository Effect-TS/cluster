import * as Debug from "@effect/io/debug";

Debug.runtimeDebug.getCallTrace = Debug.getCallTraceFromNewError;
Debug.runtimeDebug.traceFilter = (trace) => trace.startsWith(__dirname);
Debug.runtimeDebug.minumumLogLevel = "All";

import("./main");

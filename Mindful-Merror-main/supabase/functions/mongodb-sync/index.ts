import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// MongoDB Data API endpoint
const MONGODB_DATA_API = "https://data.mongodb-api.com/app/data-api/endpoint/data/v1";

class MongoConfigError extends Error {}

function parseMongoConfig(value: string) {
  const trimmed = value.trim();
  const pipeParts = trimmed.split("|").map((part) => part.trim());

  if (pipeParts.length === 3 && pipeParts.every(Boolean)) {
    const [dataSource, database, apiKey] = pipeParts;
    return { dataSource, database, apiKey };
  }

  if (trimmed.startsWith("mongodb+srv://")) {
    let url: URL;
    try {
      url = new URL(trimmed);
    } catch {
      throw new MongoConfigError("MongoDB connection string is malformed. Use cluster|database|dataApiKey instead.");
    }

    const dataSource = url.hostname.split(".")[0];
    const database = url.pathname.replace(/^\//, "");
    const apiKey = url.searchParams.get("apiKey")?.trim();

    if (dataSource && database && apiKey) {
      return { dataSource, database, apiKey };
    }

    throw new MongoConfigError(
      "MONGODB_URI is a MongoDB connection string, but this function uses the MongoDB Data API. Set it as cluster|database|dataApiKey. The dataApiKey is not your database password."
    );
  }

  throw new MongoConfigError("Invalid MONGODB_URI format. Use cluster|database|dataApiKey.");
}

function offlineResult(action?: string, message?: string) {
  const base = { synced: false, setupRequired: true, warning: message || "MongoDB sync is not configured." };

  switch (action) {
    case "find":
    case "findBySession":
    case "getSessions":
      return { ...base, documents: [] };
    case "insertOne":
      return { ...base, insertedId: null };
    case "insertMany":
      return { ...base, insertedIds: [] };
    case "updateOne":
      return { ...base, matchedCount: 0, modifiedCount: 0, upsertedId: null };
    case "deleteOne":
      return { ...base, deletedCount: 0 };
    default:
      return base;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let requestAction: string | undefined;

  try {
    const { action, collection, data, filter, sessionId } = await req.json();
    requestAction = action;
    const MONGODB_URI = Deno.env.get("MONGODB_URI");
    if (!MONGODB_URI) {
      return new Response(JSON.stringify(offlineResult(action, "MONGODB_URI is not configured.")), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { dataSource, database, apiKey } = parseMongoConfig(MONGODB_URI);
    console.log(`MongoDB sync action: ${action} on ${collection}`);

    const makeRequest = async (endpoint: string, body: object) => {
      const response = await fetch(`${MONGODB_DATA_API}/action/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          dataSource,
          database,
          collection,
          ...body,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("MongoDB API error:", errorText);
        throw new Error(`MongoDB API error: ${response.status}`);
      }

      return response.json();
    };

    let result;

    switch (action) {
      case "insertOne":
        result = await makeRequest("insertOne", { document: { ...data, createdAt: new Date().toISOString() } });
        break;

      case "insertMany":
        result = await makeRequest("insertMany", { 
          documents: data.map((doc: any) => ({ ...doc, createdAt: new Date().toISOString() })) 
        });
        break;

      case "updateOne":
        result = await makeRequest("updateOne", {
          filter,
          update: { $set: { ...data, updatedAt: new Date().toISOString() } },
          upsert: true,
        });
        break;

      case "find":
        result = await makeRequest("find", { filter: filter || {}, sort: { createdAt: -1 }, limit: 100 });
        break;

      case "findBySession":
        result = await makeRequest("find", { 
          filter: { sessionId }, 
          sort: { createdAt: 1 },
          limit: 500 
        });
        break;

      case "deleteOne":
        result = await makeRequest("deleteOne", { filter });
        break;

      case "getSessions":
        // Get unique sessions with their latest message
        result = await makeRequest("find", {
          filter: {},
          sort: { createdAt: -1 },
          limit: 50,
        });
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("MongoDB sync error:", e);
    if (e instanceof MongoConfigError) {
      return new Response(JSON.stringify(offlineResult(requestAction, e.message)), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
